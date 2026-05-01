const Transaction = require("../models/Transaction");

// GET /api/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [monthlyTotals, flaggedCount, totalTransactions, volumeResult] =
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
      ]);

    const totalVolume = volumeResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        monthlyTotals,
        flaggedCount,
        totalTransactions,
        totalVolume,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
