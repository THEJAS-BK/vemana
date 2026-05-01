const blockchainService = require("../services/blockchainService");
const Transaction = require("../models/Transaction");

// 7 clean + 3 flagged, spread across Jan–Apr 2025
// Timestamps are Unix seconds (IST dates converted to UTC)
const SEED_DATA = [
  // ── January 2025 ──────────────────────────────────────────────────────────
  {
    sender: "Ministry of Finance",
    receiver: "National Highways Authority of India",
    amount: 4500000,
    timestamp: 1735689600, // 2025-01-01
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Education",
    receiver: "Central Board of Secondary Education",
    amount: 1250000,
    timestamp: 1736208000, // 2025-01-07
    flagResult: { status: "clean", reason: "" },
  },
  // ── February 2025 ─────────────────────────────────────────────────────────
  {
    sender: "Ministry of Health & Family Welfare",
    receiver: "AIIMS New Delhi",
    amount: 3875000,
    timestamp: 1738540800, // 2025-02-03
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Agriculture & Farmers Welfare",
    receiver: "National Food Security Mission",
    amount: 980000,
    timestamp: 1739145600, // 2025-02-10
    flagResult: { status: "clean", reason: "" },
  },
  // ── March 2025 ────────────────────────────────────────────────────────────
  {
    sender: "Ministry of Defence",
    receiver: "Defence Research & Development Organisation",
    amount: 6720000,
    timestamp: 1741392000, // 2025-03-08
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Dept. of Water Resources",
    receiver: "Central Water Commission",
    amount: 2200000,
    timestamp: 1742428800, // 2025-03-20
    flagResult: { status: "clean", reason: "" },
  },
  {
    sender: "Ministry of Railways",
    receiver: "Rail Vikas Nigam Ltd",
    amount: 5430000,
    timestamp: 1742860800, // 2025-03-25
    flagResult: { status: "clean", reason: "" },
  },
  // ── April 2025 — Flagged ──────────────────────────────────────────────────
  {
    sender: "Dept. of Urban Development",
    receiver: "Smart Cities Mission Directorate",
    amount: 12500000, // >₹1 Cr
    timestamp: 1744416000, // 2025-04-12
    flagResult: {
      status: "suspicious",
      reason: "Amount exceeds ₹1 Cr single-transaction threshold",
    },
  },
  {
    sender: "Ministry of Finance",
    receiver: "Prime Minister's National Relief Fund",
    amount: 5000000, // round number
    timestamp: 1745366400, // 2025-04-23
    flagResult: {
      status: "suspicious",
      reason: "Suspicious round-number transaction — possible ghost entry",
    },
  },
  {
    sender: "Dept. of Education",
    receiver: "Central Board of Secondary Education",
    amount: 1250000, // same sender/receiver/amount as tx #2
    timestamp: 1745452800, // 2025-04-24 (within 24 h of tx #9)
    flagResult: {
      status: "suspicious",
      reason: "Velocity alert — identical sender repeated within 24 hours",
    },
  },
];

async function seedTransactions() {
  try {
    // Guard: check blockchain count, not MongoDB
    const count = await blockchainService.getTransactionCount();
    if (count > 0) {
      console.log(`[Seed] Blockchain already has ${count} tx. Skipping.`);
      return;
    }

    console.log("[Seed] Blockchain empty — seeding 10 transactions...");

    for (const tx of SEED_DATA) {
      const { txId, blockchainHash, blockNumber } =
        await blockchainService.writeTransaction(
          tx.sender,
          tx.receiver,
          tx.amount,
          tx.timestamp
        );

      await Transaction.create({
        txId,
        sender: tx.sender,
        receiver: tx.receiver,
        amount: tx.amount,
        timestamp: tx.timestamp,
        blockchainHash,
        blockNumber,
        flagResult: tx.flagResult,
        createdAt: new Date(tx.timestamp * 1000),
      });

      const flag = tx.flagResult.status === "suspicious" ? "🚩" : "✅";
      console.log(
        `  [Seed] ${flag} txId=${txId} | ${tx.sender} → ${tx.receiver} | ₹${tx.amount.toLocaleString("en-IN")}`
      );
    }

    console.log("[Seed] ✅ Done — 7 clean + 3 flagged transactions seeded.");
  } catch (err) {
    console.error("[Seed] Failed:", err.message);
  }
}

module.exports = seedTransactions;
