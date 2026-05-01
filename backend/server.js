require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { ethers } = require("ethers");

const transactionRoutes = require("./routes/transactions");
const analyticsRoutes = require("./routes/analytics");
const authRoutes = require("./routes/auth");
const blockchainService = require("./services/blockchainService");
const pythonService = require("./services/pythonService");
const seedTransactions = require("./seed/seedTransactions");

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api", authRoutes);

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", async (req, res) => {
  const health = { blockchain: "down", mongodb: "down", python: "down" };

  // MongoDB
  health.mongodb = mongoose.connection.readyState === 1 ? "ok" : "down";

  // Blockchain (Hardhat node)
  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.HARDHAT_NETWORK_URL || "http://127.0.0.1:8545"
    );
    await provider.getBlockNumber();
    health.blockchain = "ok";
  } catch {
    // stays "down"
  }

  // Python microservice
  health.python = await pythonService.healthCheck();

  const allOk = Object.values(health).every((v) => v === "ok");
  res.status(allOk ? 200 : 207).json({ success: true, data: health });
});

// ── Root ─────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    name: "Aethera Fund Transparency API",
    version: "1.0.0",
    status: "running",
    endpoints: [
      "GET  /api/health",
      "GET  /api/transactions",
      "GET  /api/transactions?flagged=true",
      "GET  /api/transactions/:id",
      "POST /api/transactions",
      "GET  /api/analytics",
      "GET  /api/users",
      "POST /api/login",
    ],
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("[Error]", err.message);
  res.status(500).json({ success: false, error: err.message });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/aethera";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(`[MongoDB] Connected → ${MONGO_URI}`);

    // Init blockchain + seed
    try {
      blockchainService.init();
      await seedTransactions();
    } catch (err) {
      console.warn(
        "[Blockchain] Could not connect or seed:",
        err.message,
        "\n  → Make sure Hardhat node is running and contract is deployed."
      );
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Aethera API  →  http://localhost:${PORT}`);
      console.log(`📋 Health check →  http://localhost:${PORT}/api/health\n`);
    });
  })
  .catch((err) => {
    console.error("[MongoDB] Connection failed:", err.message);
    process.exit(1);
  });
