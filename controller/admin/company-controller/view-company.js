module.exports = {
  viewCompany: async (req, res) => {
    try {
      const companyDetails = await companySchema.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails", // Unwind the userDetails array
        },
        {
          $project: {
            _id: 1,
            company_name: 1,
            legal_name: 1,
            user_id: 1,
            deleted: 1,
            created_at: 1,
            updated_at: 1,
            deleted_at: 1,
            company_logo: 1,
            ownerName: "$userDetails.name", // Project the user_name field from userDetails
          },
        },
        {
          $sort: { created_at: -1 },
        },
      ]);
      res.render(`${appPath}/admin/view-company.ejs`, { companyDetails });
    } catch (error) {
      console.log("viewCompany Error:" + error);
    }
  },
  viewSpecificCompany: async (req, res) => {
    // console.log(req.query.id);
    const companyDetails = await companySchema.find({ user_id: req.query.id });
    res.render(`${appPath}/admin/view-specific-company.ejs`, {companyDetails});
    console.log(companyDetails);
  },
  viewSpecificBranch: async (req, res) => {
    // console.log(req.query.id);
    const branchDetails = await branchSchema.find({ company_id: req.query.id });
    res.render(`${appPath}/admin/view-specific-branch.ejs`, {branchDetails});
  },
};
