
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// 1. GET all item types
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM item_types ORDER BY id"
        );

        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. GET single item type
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM item_types WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Item type not found"
            });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. CREATE item type
router.post("/", async (req, res) => {
    try {
        const { type_name } = req.body;

        if (!type_name || !type_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Type name is required"
            });
        }

        const [result] = await db.query(
            "INSERT INTO item_types (type_name) VALUES (?)",
            [type_name.trim()]
        );

        res.status(201).json({
            success: true,
            message: "Item type created successfully",
            id: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Item type already exists"
            });
        }

        res.status(500).json({ success: false, message: error.message });
    }
});

// 4. UPDATE item type
router.put("/:id", async (req, res) => {
    try {
        const { type_name } = req.body;

        if (!type_name || !type_name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Type name is required"
            });
        }

        const [result] = await db.query(
            "UPDATE item_types SET type_name = ? WHERE id = ?",
            [type_name.trim(), req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Item type not found"
            });
        }

        res.json({
            success: true,
            message: "Item type updated successfully"
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Item type already exists"
            });
        }

        res.status(500).json({ success: false, message: error.message });
    }
});

// 5. DELETE item type
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM item_types WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Item type not found"
            });
        }

        res.json({
            success: true,
            message: "Item type deleted successfully"
        });
    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                success: false,
                message: "Cannot delete this type because items are using it"
            });
        }

        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
