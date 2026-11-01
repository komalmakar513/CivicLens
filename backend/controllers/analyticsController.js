const Problem = require("../models/Problem");

const getDashboardAnalytics = async (req, res) => {
  try {
    const [
      totalReports,
      resolvedReports,
      pendingReports,
      highPriorityReports,
      categoryStats,
      severityStats,
      statusStats,
      monthlyStats,
    ] = await Promise.all([
      Problem.countDocuments(),

      Problem.countDocuments({ status: "Resolved" }),

      Problem.countDocuments({ status: { $ne: "Resolved" } }),

      Problem.countDocuments({
        severity: "High",
        status: { $ne: "Resolved" },
      }),

      Problem.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      Problem.aggregate([
        {
          $group: {
            _id: "$severity",
            count: { $sum: 1 },
          },
        },
      ]),

      Problem.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      Problem.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth() - 5,
                1
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            reports: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0],
              },
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),
    ]);

    // Include months with zero reports so the chart always shows six months.
    const monthlyMap = new Map(
      monthlyStats.map((item) => [
        `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        {
          reports: item.reports,
          resolved: item.resolved,
        },
      ])
    );

    const now = new Date();

    const completeMonthlyStats = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - 5 + index,
        1
      );

      const month = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const values = monthlyMap.get(month) || {
        reports: 0,
        resolved: 0,
      };

      return {
        month,
        reports: values.reports,
        resolved: values.resolved,
      };
    });

    const analytics = {
      totalReports,
      resolvedReports,
      pendingReports,
      highPriorityReports,

      resolutionRate:
        totalReports === 0
          ? 0
          : Math.round((resolvedReports / totalReports) * 100),

      categoryStats: categoryStats.map((item) => ({
        category: item._id,
        count: item.count,
      })),

      severityStats: severityStats.map((item) => ({
        severity: item._id,
        count: item.count,
      })),

      statusStats: statusStats.map((item) => ({
        status: item._id,
        count: item.count,
      })),

      monthlyStats: completeMonthlyStats,
    };

    return res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics.",
    });
  }
};

module.exports = { getDashboardAnalytics };