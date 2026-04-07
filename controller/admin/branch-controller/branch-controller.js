module.exports = {
    viewBranch: async (req, res) => {
      try {
        const branchDetails = await branchSchema.find();
        res.render(`${appPath}/admin/view-branch.ejs`, { branchDetails });
      } catch (error) {
        console.log("viewCompany Error:" + error);
      }
    },
}