/**
 * AETHERA — RESET SCRIPT
 * Wipes all transaction data from MongoDB so you can start a clean test.
 *
 * Usage:
 *   node scripts/reset.js           ← wipes MongoDB only (fast, keep Hardhat running)
 *   node scripts/reset.js --full    ← also prints exact commands for full blockchain reset
 *
 * What this does:
 *   - Drops the transactions collection in MongoDB
 *   - Blockchain state is NOT touched (Hardhat reset requires node restart)
 *
 * After running this:
 *   - The server auto-seed guard checks blockchain count (not MongoDB)
 *   - So if the blockchain still has txns, auto-seed will NOT re-run
 *   - If you want a clean slate including blockchain → use --full instructions
 */

require("dotenv").config();
const mongoose = require("mongoose");

const FULL = process.argv.includes("--full");

async function reset() {
  console.log("\n⚠️  AETHERA RESET\n");

  // ── Step 1: Wipe MongoDB ──────────────────────────────────────────────────
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/aethera");
  console.log("[Reset] MongoDB connected");

  const result = await mongoose.connection.collection("transactions").deleteMany({});
  console.log(`[Reset] ✅ Deleted ${result.deletedCount} transaction records from MongoDB\n`);

  await mongoose.disconnect();

  // ── Step 2: Guidance ──────────────────────────────────────────────────────
  if (FULL) {
    console.log("══════════════════════════════════════════════════════════");
    console.log("  FULL RESET — Blockchain + MongoDB");
    console.log("══════════════════════════════════════════════════════════");
    console.log("");
    console.log("MongoDB is now clean. To also reset the blockchain:");
    console.log("");
    console.log("  1. Stop the Hardhat node (Ctrl+C in its terminal)");
    console.log("  2. Stop the Express server (Ctrl+C in its terminal)");
    console.log("  3. Run in separate terminals:");
    console.log("");
    console.log("     Terminal A:  npx hardhat node");
    console.log("     Terminal B:  npm run deploy");
    console.log("     Terminal C:  npm start");
    console.log("");
    console.log("  The server will auto-seed 10 baseline transactions on first boot.");
    console.log("  Then run demo data if needed:");
    console.log("     node scripts/demo-data.js");
    console.log("");
  } else {
    console.log("══════════════════════════════════════════════════════════");
    console.log("  MongoDB cleared. Hardhat node still running.");
    console.log("");
    console.log("  Options:");
    console.log("  A) Re-seed baseline (10 txns):    just restart the server");
    console.log("     npm start   (auto-seed won't run — blockchain not empty)");
    console.log("");
    console.log("  B) Insert demo data on top:       node scripts/demo-data.js");
    console.log("");
    console.log("  C) Full blockchain + DB reset:    node scripts/reset.js --full");
    console.log("══════════════════════════════════════════════════════════\n");
  }
}

reset().catch((err) => {
  console.error("[Reset] Error:", err.message);
  process.exit(1);
});
