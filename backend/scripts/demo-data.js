/**
 * AETHERA — DEMO DATA SCRIPT
 * Adds 25 impressive demo transactions to blockchain + MongoDB.
 * Safe to run on top of existing seed data (additive, no destructive ops).
 *
 * Usage:
 *   node scripts/demo-data.js
 *
 * Requirements:
 *   - Hardhat node running (npx hardhat node)
 *   - Contract deployed (npm run deploy)
 *   - MongoDB running
 *
 * NOTE: Uses Hardhat account #1 (server uses #0) to avoid nonce collisions.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");
const Transaction = require("../models/Transaction");

// Hardhat account #1 private key (Account #0 is used by the server)
const PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── Demo narrative: 6 months of fiscal data with a suspicious spike in May ──
// Amounts in Indian Rupees. Timestamps in Unix seconds (UTC).

const DEMO_TRANSACTIONS = [
  // ── October 2024 — Routine allocations ───────────────────────────────────
  {
    sender: "Ministry of Finance",
    receiver: "NITI Aayog",
    amount: 3750000,         // ₹37.5 L
    timestamp: 1727740800,   // 2024-10-01
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Science & Technology",
    receiver: "Indian Space Research Organisation",
    amount: 8920000,         // ₹89.2 L
    timestamp: 1728172800,   // 2024-10-06
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Ministry of Health & Family Welfare",
    receiver: "National Health Authority",
    amount: 2640000,
    timestamp: 1728518400,   // 2024-10-10
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Telecommunications",
    receiver: "Bharat Sanchar Nigam Ltd",
    amount: 6100000,
    timestamp: 1729036800,   // 2024-10-16
    flagResult: { status: "clean", reason: "" },
  },

  // ── November 2024 — Capital projects ─────────────────────────────────────
  {
    sender: "Ministry of Road Transport & Highways",
    receiver: "National Highways Authority of India",
    amount: 9480000,
    timestamp: 1730419200,   // 2024-11-01
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Atomic Energy",
    receiver: "Bhabha Atomic Research Centre",
    amount: 7250000,
    timestamp: 1731024000,   // 2024-11-08
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Ministry of Education",
    receiver: "Indian Institutes of Technology Council",
    amount: 4380000,
    timestamp: 1731542400,   // 2024-11-14
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Water Resources",
    receiver: "National Water Development Agency",
    amount: 3195000,
    timestamp: 1732147200,   // 2024-11-21
    flagResult: { status: "clean", reason: "" },
  },

  // ── December 2024 — Year-end budget utilisation ───────────────────────────
  {
    sender: "Ministry of Agriculture",
    receiver: "Indian Council of Agricultural Research",
    amount: 5560000,
    timestamp: 1733011200,   // 2024-12-01
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Ministry of Railways",
    receiver: "Rail Land Development Authority",
    amount: 11200000,
    timestamp: 1733702400,   // 2024-12-09
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Housing & Urban Affairs",
    receiver: "Housing & Urban Development Corporation",
    amount: 6875000,
    timestamp: 1734220800,   // 2024-12-15
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Ministry of Petroleum & Natural Gas",
    receiver: "Oil & Natural Gas Corporation",
    amount: 4320000,
    timestamp: 1734912000,   // 2024-12-23
    flagResult: { status: "clean", reason: "" },
  },

  // ── January 2025 — New fiscal year opens ─────────────────────────────────
  {
    sender: "Ministry of Defence",
    receiver: "Defence Research & Development Organisation",
    amount: 9750000,
    timestamp: 1735776000,   // 2025-01-02
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Biotechnology",
    receiver: "Indian Council of Medical Research",
    amount: 2890000,
    timestamp: 1736380800,   // 2025-01-09
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Ministry of Civil Aviation",
    receiver: "Airports Authority of India",
    amount: 7430000,
    timestamp: 1737072000,   // 2025-01-17
    flagResult: { status: "clean", reason: "" },
  },

  // ── February 2025 ─────────────────────────────────────────────────────────
  {
    sender: "Ministry of Jal Shakti",
    receiver: "Central Ground Water Board",
    amount: 3640000,
    timestamp: 1738368000,   // 2025-02-01
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Pharmaceuticals",
    receiver: "Hindustan Antibiotics Ltd",
    amount: 5120000,
    timestamp: 1739059200,   // 2025-02-09
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Ministry of Power",
    receiver: "Power Finance Corporation",
    amount: 8460000,
    timestamp: 1739750400,   // 2025-02-17
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Ministry of Steel",
    receiver: "Steel Authority of India Ltd",
    amount: 6230000,
    timestamp: 1740268800,   // 2025-02-23
    flagResult: { status: "clean", reason: "" },
  },

  // ── March 2025 — Anomaly cluster (judges should catch this) ───────────────
  {
    sender: "Ministry of Finance",
    receiver: "National Infrastructure Investment Fund",
    amount: 45000000,        // 🚩 ₹4.5 Cr — far exceeds threshold
    timestamp: 1740960000,   // 2025-03-03
    flagResult: {
      status: "suspicious",
      reason: "Transaction volume 6x above 90-day rolling average for sender",
    },
  },
  {
    sender: "Dept. of Economic Affairs",
    receiver: "Infrastructure Investment Trust",
    amount: 20000000,        // 🚩 ₹2 Cr — round number, no prior relationship
    timestamp: 1741046400,   // 2025-03-04 (next day — velocity)
    flagResult: {
      status: "suspicious",
      reason: "Round-number transfer to new counterparty within 24h of prior anomaly",
    },
  },
  {
    sender: "Ministry of Finance",
    receiver: "National Infrastructure Investment Fund",
    amount: 45000000,        // 🚩 Exact duplicate of txn #20
    timestamp: 1741132800,   // 2025-03-05
    flagResult: {
      status: "suspicious",
      reason: "Exact duplicate detected — identical sender, receiver, and amount within 72 hours",
    },
  },
  {
    sender: "Dept. of Urban Development",
    receiver: "Smart Cities SPV — Pune",
    amount: 15000000,        // 🚩 ₹1.5 Cr — threshold breach
    timestamp: 1741996800,   // 2025-03-15
    flagResult: {
      status: "suspicious",
      reason: "Exceeds ₹1 Cr single-transaction threshold; no supporting PO reference",
    },
  },

  // ── Post-anomaly: clean transactions resume ───────────────────────────────
  {
    sender: "Ministry of Health & Family Welfare",
    receiver: "All India Institute of Hygiene & Public Health",
    amount: 2175000,
    timestamp: 1742860800,   // 2025-03-25
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Science & Technology",
    receiver: "National Science Academy",
    amount: 1830000,
    timestamp: 1743552000,   // 2025-04-02
    flagResult: { status: "clean", reason: "" },
  },
];

async function runDemo() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/aethera");
  console.log("[Demo] MongoDB connected");

  // Setup dedicated blockchain connection for this script
  const deployedPath = path.join(__dirname, "../deployed.json");
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));
  const provider = new ethers.JsonRpcProvider(process.env.HARDHAT_NETWORK_URL || "http://127.0.0.1:8545");
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(deployed.address, deployed.abi, signer);

  const startCount = await contract.transactionCount();
  console.log(`[Demo] Blockchain currently has ${startCount} transactions. Adding ${DEMO_TRANSACTIONS.length} demo txns...\n`);

  let clean = 0, flagged = 0;

  for (const tx of DEMO_TRANSACTIONS) {
    // Send transaction to blockchain
    const blockchainTx = await contract.addTransaction(
      tx.sender,
      tx.receiver,
      BigInt(tx.amount),
      BigInt(tx.timestamp)
    );
    const receipt = await blockchainTx.wait();
    const count = await contract.transactionCount();
    const txId = Number(count) - 1;

    // Save metadata to MongoDB
    await Transaction.create({
      txId,
      sender: tx.sender,
      receiver: tx.receiver,
      amount: tx.amount,
      timestamp: tx.timestamp,
      blockchainHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      flagResult: tx.flagResult,
      createdAt: new Date(tx.timestamp * 1000),
    });

    await sleep(200); // Small delay to prevent nonce issues on rapid execution

    const isFlagged = tx.flagResult.status === "suspicious";
    isFlagged ? flagged++ : clean++;
    const icon = isFlagged ? "🚩" : "✅";
    const inr = tx.amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    console.log(`  ${icon} txId=${txId} | ${inr}`);
    console.log(`      ${tx.sender.substring(0, 35)} → ${tx.receiver.substring(0, 35)}`);
    if (isFlagged) console.log(`      ⚠️  ${tx.flagResult.reason}`);
    console.log();
  }

  const endCount = await contract.transactionCount();
  console.log("──────────────────────────────────────────────────────");
  console.log(`✅ Done! ${clean} clean + ${flagged} flagged demo transactions written`);
  console.log(`   Blockchain total: ${endCount} transactions`);
  const total = await Transaction.countDocuments();
  console.log(`   MongoDB total:    ${total} records`);
  console.log("──────────────────────────────────────────────────────");

  await mongoose.disconnect();
}

runDemo().catch((err) => {
  console.error("[Demo] Error:", err.message);
  process.exit(1);
});
