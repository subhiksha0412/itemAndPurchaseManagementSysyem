
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const itemTypeRoutes = require("./routes/itemTypeRoutes");
const itemRoutes = require("./routes/itemRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Database connection test
app.get("/api/health", async (req, res) => {
    try {
        const connection = await db.getConnection();
        connection.release();

        res.json({
            success: true,
            message: "Backend and Database Connected Successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Database Connection Failed"
        });
    }
});

// API routes
app.use("/api/itemTypeRoutes", itemTypeRoutes);
app.use("/api/itemRoutes", itemRoutes);
app.use("/api/purchaseRoutes", purchaseRoutes);

app.get("/", (req, res) => {
    res.send("Item and Purchase Management System");
});

module.exports = app;
