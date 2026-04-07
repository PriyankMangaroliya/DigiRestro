const purchaseSubscription = require("../../../modules/purchase-subscription-model");

module.exports = {
  dashboardData: async (req, res) => {
    try {
      const today = new Date();
      // const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const startDate = new Date(year, 0, 1); // January 1st of the current year
      const endDate = new Date(year + 1, 0, 1); // January 1st of the next year
      const pastYearStartDate = new Date(year - 1, 0, 1);
      const pastYearEndDate = new Date(year, 0, 1);

      const currentYearCustomerCount = await usersSchema.countDocuments({
        role_name: "O",
        created_at: { $gt: startDate, $lte: endDate },
      });

      const pastYearCustomerCount = await usersSchema.countDocuments({
        role_name: "O",
        created_at: { $gt: pastYearStartDate, $lte: pastYearEndDate },
      });

      // const incDecCustomers = pastYearCustomerCount * 100 / currentYearCustomerCount;
      // const incDecCustomers =
      //   ((currentYearCustomerCount - pastYearCustomerCount) /
      //     pastYearCustomerCount) *
      //   100;
      // const incDecCustomers = Math.min(
      //   ((currentYearCustomerCount - pastYearCustomerCount) /
      //     pastYearCustomerCount) *
      //     100,
      //   100
      // );
      const incDecCustomers = Math.min(
        ((currentYearCustomerCount - pastYearCustomerCount) /
          pastYearCustomerCount) *
          100,
        100
      ).toFixed(2);

      const currentYearBranchCount = await usersSchema.countDocuments({
        role_name: "B",
        created_at: { $gt: startDate, $lte: endDate },
      });

      const pastYearBranchCount = await usersSchema.countDocuments({
        role_name: "B",
        created_at: { $gt: pastYearStartDate, $lte: pastYearEndDate },
      });

      const incDecBranch = Math.min(
        ((currentYearBranchCount - pastYearBranchCount) / pastYearBranchCount) *
          100,
        100
      ).toFixed(2);
      const currentYearPurSubCount =
        await purchaseSubscriptionSchema.countDocuments({
          start_date: { $gt: startDate, $lte: endDate },
        });

      const pastYearPurSubCount =
        await purchaseSubscriptionSchema.countDocuments({
          startDate: { $gt: pastYearStartDate, $lte: pastYearEndDate },
        });

      const incDecPurSub = Math.min(
        ((currentYearPurSubCount - pastYearPurSubCount) / pastYearPurSubCount) *
          100,
        100
      ).toFixed(2);

      const currentYearRevenue = await purchaseSubscriptionSchema.aggregate([
        {
          $match: {
            start_date: { $gt: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: 0,
            totalRevenue: { $sum: "$price" },
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id field from the result
            totalRevenue: 1, // Include totalRevenue field in the result
          },
        },
      ]);
      const cYRevenue = currentYearRevenue[0].totalRevenue;
      var pastYearRevenue = await purchaseSubscriptionSchema.aggregate([
        {
          $match: {
            start_date: { $gt: pastYearStartDate, $lte: pastYearEndDate },
          },
        },
        {
          $group: {
            _id: 0,
            totalRevenue: { $sum: "$price" },
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id field from the result
            totalRevenue: 1, // Include totalRevenue field in the result
          },
        },
      ]);

      if (
        _.isEmpty(pastYearRevenue) ||
        _.isNull(pastYearRevenue) ||
        _.isUndefined(pastYearRevenue)
      ) {
        pastYearRevenue = 0;
        var incDecRevenue = null;
        incDecRevenue = Math.min(
          ((currentYearRevenue[0].totalRevenue - pastYearRevenue) /
            pastYearRevenue) *
            100,
          100
        ).toFixed(2);
      } else {
        incDecRevenue = Math.min(
          ((currentYearRevenue[0].totalRevenue -
            pastYearRevenue[0].totalRevenue) /
            pastYearRevenue[0].totalRevenue) *
            100,
          100
        ).toFixed(2);
      }

      res.render(`${appPath}/admin/index.ejs`, {
        currentYearCustomerCount,
        incDecCustomers,
        currentYearBranchCount,
        incDecBranch,
        currentYearPurSubCount,
        incDecPurSub,
        cYRevenue,
        incDecRevenue,
      });
    } catch (error) {
      console.log("DashboardData Error: " + error);
    }
  },

  revenueChart: async (req, res) => {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const revenueData = await purchaseSubscriptionSchema.aggregate([
        {
          $match: {
            start_date: {
              $gte: new Date(year, 0, 1),
              $lt: new Date(year + 1, 0, 1),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$start_date" },
              month: { $month: "$start_date" },
            },
            totalPrice: { $sum: "$price" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            totalPrice: 1,
          },
        },
      ]);
      res.status(200).send({
        success: true,
        message: "Data retrieved successfully",
        revenueData,
      });
    } catch (error) {
      console.log("revenueChart Error: " + error);
    }
  },

  yearlyRevenueChart: async (req, res) => {
    console.log("Yes");
    const yearlyRevenueData = await purchaseSubscriptionSchema.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$start_date" },
          },
          totalPrice: { $sum: "$price" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          totalPrice: 1,
        },
      },
    ]);
    console.log(yearlyRevenueData);
    res.status(200).send({
      success: true,
      message: "Data retrieved successfully",
      yearlyRevenueData,
    });
  },

  growthChart: async (req, res) => {
    try {
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);

      const clientsData = await usersSchema.aggregate([
        {
          $match: {
            role_name: "O",
            created_at: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$created_at" } },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, month: "$_id.month", count: 1 } },
      ]);

      const branchesData = await usersSchema.aggregate([
        {
          $match: {
            role_name: "B",
            created_at: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$created_at" } },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, month: "$_id.month", count: 1 } },
      ]);

      const companyData = await companySchema.aggregate([
        {
          $match: {
            created_at: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$created_at" } },
            count: { $sum: 1 },
          },
        },
        { $project: { _id: 0, month: "$_id.month", count: 1 } },
      ]);

      res.status(200).send({
        success: true,
        growthData: {
          clients: clientsData,
          branches: branchesData,
          companies: companyData,
        },
      });
    } catch (error) {
      console.log("growthChart Error: " + error);
      res.status(500).send({ success: false, error: error.message });
    }
  },
};
