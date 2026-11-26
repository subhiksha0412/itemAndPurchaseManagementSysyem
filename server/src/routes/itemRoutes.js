
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. GET all items with item type
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, t.type_name
            FROM items i
            JOIN item_types t ON i.item_type_id = t.id
            ORDER BY i.id
        `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET stock details
// Keep this route BEFORE /:id
router.get("/stock", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT id, name, stock_available,
                CASE
                    WHEN stock_available = 0 THEN 'Out of Stock'
                    WHEN stock_available <= 5 THEN 'Low Stock'
                    ELSE 'In Stock'
                END AS stock_status
            FROM items
            ORDER BY id
        `);

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. GET single item
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT i.*, t.type_name
            FROM items i
            JOIN item_types t ON i.item_type_id = t.id
            WHERE i.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. CREATE item
router.post("/", async (req, res) => {
    try {
        const {
            name,
            purchase_date,
            stock_available,
            item_type_id,
            active = true
        } = req.body;

        if (!name || !name.trim() || !purchase_date ||
            stock_available === undefined || !item_type_id) {
            return res.status(400).json({
                success: false,
                message: "Name, purchase date, stock and item type are required"
            });
        }

        if (!Number.isInteger(Number(stock_available)) ||
            Number(stock_available) < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative whole number"
            });
        }

        if (![true, false, 0, 1].includes(active)) {
            return res.status(400).json({
                success: false,
                message: "Active must be true or false"
            });
        }

        const [type] = await db.query(
            "SELECT id FROM item_types WHERE id = ?",
            [item_type_id]
        );

        if (type.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid item type"
            });
        }

        const [result] = await db.query(`
            INSERT INTO items
            (name, purchase_date, stock_available, item_type_id, active)
            VALUES (?, ?, ?, ?, ?)
        `, [
            name.trim(),
            purchase_date,
            Number(stock_available),
            item_type_id,
            active
        ]);

        res.status(201).json({
            success: true,
            message: "Item created successfully",
            id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. UPDATE item
router.put("/:id", async (req, res) => {
    try {
        const {
            name,
            purchase_date,
            stock_available,
            item_type_id,
            active
        } = req.body;

        if (!name || !name.trim() || !purchase_date ||
            stock_available === undefined || !item_type_id ||
            active === undefined) {
            return res.status(400).json({
                success: false,
                message: "All item fields are required"
            });
        }

        if (!Number.isInteger(Number(stock_available)) ||
            Number(stock_available) < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative whole number"
            });
        }

        if (![true, false, 0, 1].includes(active)) {
            return res.status(400).json({
                success: false,
                message: "Active must be true or false"
            });
        }

        const [type] = await db.query(
            "SELECT id FROM item_types WHERE id = ?",
            [item_type_id]
        );

        if (type.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid item type"
            });
        }

        const [result] = await db.query(`
            UPDATE items
            SET name = ?, purchase_date = ?, stock_available = ?,
                item_type_id = ?, active = ?
            WHERE id = ?
        `, [
            name.trim(),
            purchase_date,
            Number(stock_available),
            item_type_id,
            active,
            req.params.id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        res.json({
            success: true,
            message: "Item updated successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 6. DELETE item only when no purchase history exists
router.delete("/:id", async (req, res) => {
    try {
        const [item] = await db.query(
            "SELECT id FROM items WHERE id = ?",
            [req.params.id]
        );

        if (item.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        const [history] = await db.query(
            "SELECT id FROM purchase_items WHERE item_id = ? LIMIT 1",
            [req.params.id]
        );

        if (history.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Item has purchase history. Deactivate it instead."
            });
        }

        await db.query("DELETE FROM items WHERE id = ?", [req.params.id]);

        res.json({
            success: true,
            message: "Item deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
