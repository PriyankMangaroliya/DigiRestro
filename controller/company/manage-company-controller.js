const {handleAuthRedirect, setDefaultCompany, fetchAndFormatCompanies} = require("./company-helper");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
module.exports = {
    viewCompany: async (req, res) => {
        try {
            // const userId = req.session.userId;
            const userId = await tokenController.getUserID(req, res);
            // Set default company and check if it's already set
            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            console.log("Company Id in session dashboard: " + companyId);

            const companies = await companySchema.find({user_id: userId, deleted: false});

            const companyIds = companies.map(company => company._id);

            const companyDetailsWithBranchCount = await companySchema.aggregate([{
                $match: {_id: {$in: companyIds}} // Match companies with specified user_id and not deleted
            }, {
                $lookup: {
                    from: "branch", localField: "_id", foreignField: "company_id", as: "branches" // Lookup all branches associated with the company
                }
            }, {
                $addFields: {
                    totalBranch: {$size: "$branches"} // Add a field to store the total number of branches
                }
            }, {
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
                    totalBranch: 1
                }
            }]);

            // console.log(companyDetailsWithBranchCount)

            res.render(`${appPath}/company/master-company.ejs`, {
                formattedCompanies: formattedCompanies,
                companyId: companyId,
                companies: companyDetailsWithBranchCount,
                selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo, // isDefaultCompanySet: isDefaultCompanySet, // Add this line to pass the information to the view
            });

        } catch (error) {
            console.error("Error in /company/master-company:", error);
            res.status(500).send("Internal Server Error");
        }
    }, 
    addCompany: async (req, res) => {
        try {
            const { company_name, legal_name } = req.body;
            const logoPath = req.file ? '/uploads/' + req.file.filename : '';
            const userId = await tokenController.getUserID(req, res);

            const newCompany = new companySchema({
                company_logo: logoPath,
                company_name: company_name,
                legal_name: legal_name,
                user_id: new mongoose.Types.ObjectId(userId),
            });

            const result = await newCompany.save();
            if (result) {
                req.session.Success = "Company added successfully!";
            } else {
                req.session.Error = "Failed to add company.";
            }
            res.redirect("/company/manage-company");
        } catch (error) {
            console.error("addCompany error: ", error);
            req.session.Error = "An internal error occurred while adding the company.";
            res.redirect("/company/manage-company");
        }
    }, 
    updateCompany: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            const { company_name, legal_name, company_id } = req.body;

            const existingData = await companySchema.findOne({
                company_name: company_name,
                legal_name: legal_name,
                user_id: new mongoose.Types.ObjectId(userId),
                _id: { $ne: new mongoose.Types.ObjectId(company_id) },
                deleted: false
            });

            if (existingData) {
                req.session.Error = "Another company with these details already exists.";
            } else {
                const currentCompany = await companySchema.findById(company_id);
                let updateData = { company_name, legal_name };

                if (req.file) {
                    // Delete old logo if it exists
                    if (currentCompany.company_logo) {
                        const oldPath = path.join(__dirname, "../../views", currentCompany.company_logo);
                        if (fs.existsSync(oldPath)) {
                            fs.unlinkSync(oldPath);
                        }
                    }
                    updateData.company_logo = '/uploads/' + req.file.filename;
                }

                const result = await companySchema.updateOne(
                    { _id: new mongoose.Types.ObjectId(company_id) },
                    { $set: updateData }
                );

                if (result.modifiedCount > 0) {
                    req.session.Success = "Company updated successfully!";
                } else {
                    req.session.Error = "No changes were made or company not found.";
                }
            }
            res.redirect("/company/manage-company");
        } catch (error) {
            console.error("updateCompany error: ", error);
            req.session.Error = "An internal error occurred while updating the company.";
            res.redirect("/company/manage-company");
        }
    }, 
    deleteCompany: async (req, res) => {
        try {
            const companyId = req.query.id;
            const userId = await tokenController.getUserID(req, res);

            const company = await companySchema.findById(companyId);
            if (!company) {
                return res.status(404).json({ success: false, message: 'Company not found' });
            }

            // Delete physical file
            if (company.company_logo) {
                const logoPath = path.join(__dirname, "../../views", company.company_logo);
                if (fs.existsSync(logoPath)) {
                    fs.unlinkSync(logoPath);
                }
            }

            const result = await companySchema.updateOne(
                { _id: new mongoose.Types.ObjectId(companyId) },
                { $set: { deleted: true, deleted_at: new Date() } }
            );

            if (result.modifiedCount > 0) {
                await setDefaultCompany(userId, req);
                req.session.Success = "Company deleted successfully!";
                res.status(200).json({ success: true, message: 'Company deleted successfully' });
            } else {
                res.status(404).json({ success: false, message: 'Company not found' });
            }
        } catch (error) {
            console.error("deleteCompany error: ", error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
}