const mongoose = require("mongoose");

module.exports = {
  // --- Pages ---
  subscriptionReportPage: async (req, res) => {
    try {
      const clients = await usersSchema.find({ role_name: "O", deleted: { $ne: true } }, { name: 1, _id: 1 });
      const companies = await companySchema.find({ deleted: { $ne: true } }, { company_name: 1, user_id: 1, _id: 1 });
      const branches = await branchSchema.find({ deleted: { $ne: true } }, { branch_name: 1, company_id: 1, user_id: 1, _id: 1 });

      res.render(`${appPath}/admin/subscription-report.ejs`, {
        clients,
        companies,
        branches,
      });
    } catch (error) {
      console.log("subscriptionReportPage Error: " + error);
      res.redirect("/admin/dashboard");
    }
  },

  growthReportPage: async (req, res) => {
    try {
      res.render(`${appPath}/admin/growth-report.ejs`);
    } catch (error) {
      console.log("growthReportPage Error: " + error);
      res.redirect("/admin/dashboard");
    }
  },

  clientReportPage: async (req, res) => {
    try {
      const clients = await usersSchema.find({ role_name: "O", deleted: { $ne: true } }, { name: 1, _id: 1 });
      res.render(`${appPath}/admin/client-report.ejs`, { clients });
    } catch (error) {
      console.log("clientReportPage Error: " + error);
      res.redirect("/admin/dashboard");
    }
  },

  // --- Data APIs ---
  getSubscriptionData: async (req, res) => {
    try {
      const { duration, client, company, branch, startDate, endDate } = req.query;
      let matchStage = {};

      if (duration && duration !== "all") {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        if (duration === "day") {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        } else if (duration === "month") {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (duration === "year") {
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else if (duration === "custom" && startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
        }
        matchStage.start_date = { $gte: start, $lte: end };
      }

      if (branch && branch !== "all") {
        matchStage.branch_id = new mongoose.Types.ObjectId(branch);
      }

      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "branch",
            localField: "branch_id",
            foreignField: "_id",
            as: "branchDetails",
          },
        },
        { $unwind: "$branchDetails" },
        {
          $lookup: {
            from: "company",
            localField: "branchDetails.company_id",
            foreignField: "_id",
            as: "companyDetails",
          },
        },
        { $unwind: "$companyDetails" },
        {
          $lookup: {
            from: "users",
            localField: "companyDetails.user_id",
            foreignField: "_id",
            as: "clientDetails",
          },
        },
        { $unwind: "$clientDetails" },
        {
          $lookup: {
            from: "subscription_plan",
            localField: "plan_id",
            foreignField: "_id",
            as: "planDetails",
          },
        },
        { $unwind: "$planDetails" },
      ];

      if (company && company !== "all") {
        pipeline.push({ $match: { "branchDetails.company_id": new mongoose.Types.ObjectId(company) } });
      }
      if (client && client !== "all") {
        pipeline.push({ $match: { "companyDetails.user_id": new mongoose.Types.ObjectId(client) } });
      }

      pipeline.push({
        $project: {
          _id: 1,
          price: 1,
          duration: 1,
          start_date: 1,
          end_date: 1,
          is_active: 1,
          branchName: "$branchDetails.branch_name",
          companyName: "$companyDetails.company_name",
          clientName: "$clientDetails.name",
          planName: "$planDetails.plan_name",
        },
      });

      const results = await purchaseSubscriptionSchema.aggregate(pipeline);

      const enrichedResults = results.map((r) => ({
        ...r,
        status: new Date(r.end_date) < new Date() ? "Expired" : r.is_active ? "Active" : "Inactive",
      }));

      res.status(200).send({ success: true, data: enrichedResults });
    } catch (error) {
      console.log("getSubscriptionData Error: " + error);
      res.status(500).send({ success: false, error: error.message });
    }
  },

  getGrowthData: async (req, res) => {
    try {
      const { duration, type, startDate, endDate } = req.query;
      let matchStage = { deleted: { $ne: true } };

      if (duration && duration !== "all") {
        const now = new Date();
        let start = new Date();
        let end = new Date();

        if (duration === "day") {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        } else if (duration === "month") {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        } else if (duration === "year") {
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        } else if (duration === "custom" && startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
        }
        matchStage.created_at = { $gte: start, $lte: end };
      }

      let data = [];
      if (type === "client") {
        matchStage.role_name = "O";
        data = await usersSchema.find(matchStage).sort({ created_at: -1 });
      } else if (type === "branch") {
        matchStage.role_name = "B";
        // Enriched branch data from users joined with branch details
        data = await usersSchema.aggregate([
          { $match: matchStage },
          {
            $lookup: {
              from: "branch",
              localField: "_id",
              foreignField: "user_id",
              as: "branchDetails",
            },
          },
          { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "company",
              localField: "branchDetails.company_id",
              foreignField: "_id",
              as: "companyDetails",
            },
          },
          { $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              name: 1,
              email_id: 1,
              mobile_no: 1,
              created_at: 1,
              city: "$branchDetails.city",
              state: "$branchDetails.state",
              gst_no: "$branchDetails.gst_no",
              companyName: "$companyDetails.company_name",
            },
          },
          { $sort: { created_at: -1 } },
        ]);
      } else if (type === "company") {
        data = await companySchema.aggregate([
          { $match: matchStage },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "branch",
              localField: "_id",
              foreignField: "company_id",
              as: "branchList",
            },
          },
          {
            $project: {
              company_name: 1,
              legal_name: 1,
              created_at: 1,
              ownerName: "$userDetails.name",
              branchCount: { $size: "$branchList" },
            },
          },
          { $sort: { created_at: -1 } },
        ]);
      }

      res.status(200).send({ success: true, data });
    } catch (error) {
      console.log("getGrowthData Error: " + error);
      res.status(500).send({ success: false, error: error.message });
    }
  },

  getClientReport: async (req, res) => {
    try {
      const { client } = req.query;
      if (!client || client === "all") return res.send({ success: true, data: [] });

      const clientId = new mongoose.Types.ObjectId(client);
      const clientData = await usersSchema.findById(clientId).select("name email_id mobile_no");
      
      const companies = await companySchema.find({ user_id: clientId, deleted: { $ne: true } });
      const companyIds = companies.map(c => c._id);
      
      const branches = await branchSchema.find({ company_id: { $in: companyIds }, deleted: { $ne: true } }).populate("company_id", "company_name");

      res.status(200).send({ success: true, data: { client: clientData, companies, branches } });
    } catch (error) {
      console.log("getClientReport Error: " + error);
      res.status(500).send({ success: false, error: error.message });
    }
  },
};
