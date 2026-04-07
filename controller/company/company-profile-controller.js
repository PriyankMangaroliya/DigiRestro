const {setDefaultCompany, fetchAndFormatCompanies} = require("./company-helper");

module.exports = {
    companyprofileDetails: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            await setDefaultCompany(userId, req);

            const formattedCompanies = await fetchAndFormatCompanies(userId, req);
            let companyId = req.session.selectedCompanyId || (formattedCompanies[0] && formattedCompanies[0]._id);

            const usersData = await usersSchema
                .find({_id: userId})
                .select("name email_id mobile_no image");
            // res.send(usersData);
            // console.log(usersData);
            res.render(`${appPath}/company/profile.ejs`, {
                usersData, formattedCompanies: formattedCompanies,
                companyId: companyId, selectedLegalName: req.session.selectedLegalName,
                selectedCompanyLogo: req.session.selectedCompanyLogo
            });
        } catch (error) {
            // res.send("viewProfile error:" , error);
            console.log("viewProfile error: ", error);
        }
    },
    companyFetchUserName: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            const userData = await usersSchema.find({_id: userId}).select("name image");
            res.status(200).send({
                success: true,
                userName: userData[0].name.toString(),
                userImage: userData[0].image || null,
                userInitial: userData[0].name.charAt(0).toUpperCase(),
            });
        } catch (error) {
            console.log("fetchUserName error: ", error);
        }
    },
    companyUpdateProfileDetails: async (req, res) => {
        try {
            const userId = await tokenController.getUserID(req, res);
            const updateUsersData = await usersSchema.updateOne(
                {_id: userId},
                {
                    $set: {
                        name: req.body.name,
                        email_id: req.body.email_id,
                        mobile_no: req.body.mobile_no
                    },
                }
            );
            if (updateUsersData.acknowledged) {
                req.session.Success = "Profile updated successfully!";
            } else {
                req.session.Error = "Failed to update profile.";
            }
            res.redirect("/company/profile");
        } catch (error) {
            console.log("companyUpdateProfileDetails error: ", error);
            req.session.Error = "An error occurred while updating the profile.";
            res.redirect("/company/profile");
        }
    },
};
