const Transaction = require("../models/Transaction");

// GET /api/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [monthlyTotals, flaggedCount, totalTransactions, volumeResult, receiversResult] =
      await Promise.all([
        // Monthly totals via aggregation pipeline
        Transaction.aggregate([
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m",
                  date: { $toDate: { $multiply: ["$timestamp", 1000] } },
                },
              },
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, month: "$_id", total: 1, count: 1 } },
        ]),
        Transaction.countDocuments({ "flagResult.status": "suspicious" }),
        Transaction.countDocuments(),
        Transaction.aggregate([
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        // Top receivers aggregation
        Transaction.aggregate([
          { $group: { _id: "$receiver", total: { $sum: "$amount" }, count: { $sum: 1 } } },
          { $sort: { total: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, name: "$_id", total: 1, count: 1 } }
        ]),
      ]);

    const totalVolume = volumeResult[0]?.total || 0;
    const topReceivers = receiversResult; // renamed for clarity below

    res.json({
      success: true,
      data: {
        monthlyTotals,
        flaggedCount,
        totalTransactions,
        totalVolume,
        topReceivers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
