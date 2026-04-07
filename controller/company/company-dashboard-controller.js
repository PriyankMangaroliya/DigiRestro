const {
    handleAuthRedirect, setDefaultCompany, fetchAndFormatCompanies, setDefaultCompanySession
} = require("./company-helper");

const axios = require('axios');
require('dotenv').config();

module.exports = {
    dashboard: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);

            await setDefaultCompany(userId, req);

            // Fetch and format companies for the user
            const formattedCompanies = await fetchAndFormatCompanies(userId, req);

            // Get the selected company ID from session or use the first one from the list
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            const result = await branchSchema.find({company_id: new mongoose.Types.ObjectId(companyId)});

            console.log(result)
            res.render(`${appPath}/company/index.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                map : result,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo,
            });

        } catch (error) {
            console.error("Error in /company/dashboard:", error);
            res.status(500).send("Internal Server Error");
        }
    },
};