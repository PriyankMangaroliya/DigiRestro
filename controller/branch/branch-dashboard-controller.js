const {setDefaultCompany, fetchAndFormatCompanies} = require("../company/company-helper");
module.exports = {
    dashboard: async (req, res) => {
        try {
            res.render(`${appPath}/branch/index.ejs`);
        } catch (error) {
            console.error("Error in /company/dashboard:", error);
            res.status(500).send("Internal Server Error");
        }
    },
};
