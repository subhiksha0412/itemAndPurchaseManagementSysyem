
const express = require("express");
const cors = require("cors");
const path = require("path");
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
    }  catch (error) {
        console.error("DATABASE CONNECTION ERROR:", error);
        console.error("ERROR CODE:", error.code);
console.error("ERROR MESSAGE:", error.message);
console.error("ERROR SQL STATE:", error.sqlState);
    
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

// React frontend build path
const frontendPath = path.join(__dirname, "../../client/dist");

// Serve frontend static files
app.use(express.static(frontendPath));

// React Router fallback
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

module.exports = app;
