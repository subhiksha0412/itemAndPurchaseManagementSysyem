
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Helper: Get one purchase and its items
async function getPurchaseDetails(purchaseId) {
    const [purchases] = await db.query(
        "SELECT * FROM purchases WHERE id = ?",
        [purchaseId]
    );

    if (purchases.length === 0) {
        return null;
    }

    const [items] = await db.query(`
        SELECT
            pi.id,
            pi.item_id,
            i.name AS item_name,
            t.type_name,
            pi.quantity
        FROM purchase_items pi
        JOIN items i ON pi.item_id = i.id
        JOIN item_types t ON i.item_type_id = t.id
        WHERE pi.purchase_id = ?
    `, [purchaseId]);

    return {
        ...purchases[0],
        items
    };
}

// 1. GET all purchases
router.get("/", async (req, res) => {
    try {
        const [purchases] = await db.query(
            "SELECT * FROM purchases ORDER BY id DESC"
        );

        const result = [];

        for (const purchase of purchases) {
            const details = await getPurchaseDetails(purchase.id);
            result.push(details);
        }

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET single purchase
router.get("/:id", async (req, res) => {
    try {
        const purchase = await getPurchaseDetails(req.params.id);

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            });
        }

        res.json({ success: true, data: purchase });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. CREATE purchase
router.post("/", async (req, res) => {
    const connection = await db.getConnection();

    try {
        const { order_id, purchase_date, items } = req.body;

        if (!order_id || !purchase_date ||
            !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order ID, purchase date and at least one item are required"
            });
        }

        const itemIds = items.map(item => Number(item.item_id));

        if (itemIds.some(id => !Number.isInteger(id) || id <= 0) ||
            new Set(itemIds).size !== itemIds.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid or duplicate item IDs"
            });
        }

        if (items.some(item =>
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) <= 0
        )) {
            return res.status(400).json({
                success: false,
                message: "Every item quantity must be a positive whole number"
            });
        }

        await connection.beginTransaction();

        const [purchaseResult] = await connection.query(
            "INSERT INTO purchases (order_id, purchase_date) VALUES (?, ?)",
            [order_id, purchase_date]
        );

        const purchaseId = purchaseResult.insertId;

        for (const item of items) {
            const [rows] = await connection.query(
                "SELECT id, stock_available, active FROM items WHERE id = ? FOR UPDATE",
                [item.item_id]
            );

            if (rows.length === 0) {
                throw new Error(`Item ${item.item_id} not found`);
            }

            const selectedItem = rows[0];
            const quantity = Number(item.quantity);

            if (!selectedItem.active) {
                throw new Error(`Item ${item.item_id} is inactive`);
            }

            if (quantity > selectedItem.stock_available) {
                throw new Error(
                    `Insufficient stock for item ${item.item_id}. Available: ${selectedItem.stock_available}`
                );
            }

            await connection.query(
                "INSERT INTO purchase_items (purchase_id, item_id, quantity) VALUES (?, ?, ?)",
                [purchaseId, item.item_id, quantity]
            );

            await connection.query(
                "UPDATE items SET stock_available = stock_available - ? WHERE id = ?",
                [quantity, item.item_id]
            );
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Purchase created and stock updated successfully",
            purchase_id: purchaseId
        });

    } catch (error) {
        await connection.rollback();

        const status = error.code === "ER_DUP_ENTRY" ? 409 :
            error.message.includes("not found") ||
            error.message.includes("inactive") ||
            error.message.includes("Insufficient") ? 400 : 500;

        res.status(status).json({
            success: false,
            message: error.message
        });
    } finally {
        connection.release();
    }
});

// 4. UPDATE purchase
router.put("/:id", async (req, res) => {
    const connection = await db.getConnection();

    try {
        const purchaseId = req.params.id;
        const { order_id, purchase_date, items } = req.body;

        if (!order_id || !purchase_date ||
            !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order ID, purchase date and at least one item are required"
            });
        }

        const itemIds = items.map(item => Number(item.item_id));

        if (itemIds.some(id => !Number.isInteger(id) || id <= 0) ||
            new Set(itemIds).size !== itemIds.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid or duplicate item IDs"
            });
        }

        if (items.some(item =>
            !Number.isInteger(Number(item.quantity)) ||
            Number(item.quantity) <= 0
        )) {
            return res.status(400).json({
                success: false,
                message: "Every item quantity must be a positive whole number"
            });
        }

        await connection.beginTransaction();

        const [purchase] = await connection.query(
            "SELECT id FROM purchases WHERE id = ? FOR UPDATE",
            [purchaseId]
        );

        if (purchase.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            });
        }

        // Read previous purchase items
        const [oldItems] = await connection.query(
            "SELECT item_id, quantity FROM purchase_items WHERE purchase_id = ?",
            [purchaseId]
        );

        // Return old quantities to stock
        for (const oldItem of oldItems) {
            await connection.query(
                "UPDATE items SET stock_available = stock_available + ? WHERE id = ?",
                [oldItem.quantity, oldItem.item_id]
            );
        }

        // Remove old purchase lines before inserting updated lines
        await connection.query(
            "DELETE FROM purchase_items WHERE purchase_id = ?",
            [purchaseId]
        );

        // Update purchase header
        await connection.query(
            "UPDATE purchases SET order_id = ?, purchase_date = ? WHERE id = ?",
            [order_id, purchase_date, purchaseId]
        );

        // Insert new lines and deduct the updated quantities
        for (const item of items) {
            const [rows] = await connection.query(
                "SELECT id, stock_available, active FROM items WHERE id = ? FOR UPDATE",
                [item.item_id]
            );

            if (rows.length === 0) {
                throw new Error(`Item ${item.item_id} not found`);
            }

            const selectedItem = rows[0];
            const quantity = Number(item.quantity);

            if (!selectedItem.active) {
                throw new Error(`Item ${item.item_id} is inactive`);
            }

            if (quantity > selectedItem.stock_available) {
                throw new Error(
                    `Insufficient stock for item ${item.item_id}. Available: ${selectedItem.stock_available}`
                );
            }

            await connection.query(
                "INSERT INTO purchase_items (purchase_id, item_id, quantity) VALUES (?, ?, ?)",
                [purchaseId, item.item_id, quantity]
            );

            await connection.query(
                "UPDATE items SET stock_available = stock_available - ? WHERE id = ?",
                [quantity, item.item_id]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: "Purchase updated and stock adjusted successfully"
        });

    } catch (error) {
        await connection.rollback();

        const status = error.code === "ER_DUP_ENTRY" ? 409 :
            error.message.includes("not found") ||
            error.message.includes("inactive") ||
            error.message.includes("Insufficient") ? 400 : 500;

        res.status(status).json({
            success: false,
            message: error.message
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
