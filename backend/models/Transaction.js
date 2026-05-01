const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    txId: { type: Number, required: true, unique: true },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Number, required: true },
    blockchainHash: { type: String, default: "" },
    blockNumber: { type: Number, default: 0 },
    flagResult: {
      status: {
        type: String,
        enum: ["clean", "suspicious", "unknown"],
        default: "unknown",
      },
      reason: { type: String, default: "" },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Index for fast flagged queries
transactionSchema.index({ "flagResult.status": 1 });
transactionSchema.index({ timestamp: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
