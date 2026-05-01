const Transaction = require("../models/Transaction");
const blockchainService = require("../services/blockchainService");
const pythonService = require("../services/pythonService");

// GET /api/transactions[?flagged=true]
exports.getAllTransactions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.flagged === "true") {
      filter["flagResult.status"] = "suspicious";
    }
    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    
    // RBAC: Mask reasons for public observers
    const sanitized = transactions.map(t => {
      if (req.user.role === 'public') {
        const obj = t.toObject();
        if (obj.flagResult) obj.flagResult.reason = "RESTRICTED: Authorized Personnel Only";
        return obj;
      }
      return t;
    });

    res.json({ success: true, count: sanitized.length, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/transactions/:id
exports.getTransaction = async (req, res) => {
  try {
    const txId = parseInt(req.params.id);
    if (isNaN(txId)) {
      return res.status(400).json({ success: false, error: "Invalid transaction ID" });
    }
    const tx = await Transaction.findOne({ txId });
    if (!tx) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    // RBAC: Mask reasons for public observers
    let result = tx.toObject();
    if (req.user.role === 'public') {
      if (result.flagResult) result.flagResult.reason = "RESTRICTED: Authorized Personnel Only";
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/transactions/verify/:id (Public scan)
exports.verifyTransaction = async (req, res) => {
  try {
    const txId = parseInt(req.params.id);
    const tx = await Transaction.findOne({ txId });
    if (!tx) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }

    // Public view: Always mask sensitive AI reasoning for anonymous scans
    const result = tx.toObject();
    if (result.flagResult) {
      result.flagResult.reason = "RESTRICTED: Authorized Personnel Only";
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const { sender, receiver, amount, timestamp } = req.body;
    if (!sender || !receiver || !amount) {
      return res.status(400).json({
        success: false,
        error: "sender, receiver, and amount are required",
      });
    }

    const ts = timestamp || Math.floor(Date.now() / 1000);

    // 1. Write to blockchain
    const { txId, blockchainHash, blockNumber } =
      await blockchainService.writeTransaction(sender, receiver, amount, ts);

    // 2. Call Python fraud detection
    const flagResult = await pythonService.detectFraud({
      sender,
      receiver,
      amount,
      timestamp: ts,
    });

    // 3. Save to MongoDB
    const tx = await Transaction.create({
      txId,
      sender,
      receiver,
      amount,
      timestamp: ts,
      blockchainHash,
      blockNumber,
      flagResult: {
        status: flagResult.status || "unknown",
        reason: flagResult.reason || "",
      },
    });

    res.status(201).json({ success: true, data: tx });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
