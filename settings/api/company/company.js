const mongoose = require("mongoose");

const {
    fetchAndFormatCompanies, setDefaultCompany, setDefaultCompanySession, upload, handleAuthRedirect,
} = require("../../../controller/company/company-helper");
const tokenController = require("../../../controller/token-controller");
const profileController = require("../../../controller/admin/profile-controller/profile-controller");

module.exports = {
    bind_Url: function () {
        app.get("/company/dashboard", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyDashboardController.dashboard(req, res);
        });

        app.get("/company/profile", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyProfileController.companyprofileDetails(req, res);
        });

        app.get("/company/fetchUserName", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyProfileController.companyFetchUserName(req, res);
        });

        app.post("/company/update-profile", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyProfileController.companyUpdateProfileDetails(req, res);
        });

        app.post("/company/change-password", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            changePasswordController.changePassword(req, res);
        });

        app.post("/storeSelectedCompany", async (req, res) => {
            try {
                const callback = await tokenController.auth(req, res);
                if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

                const selectedCompanyId = req.body.companyId;
                const selectedCompany = await companySchema.findById(selectedCompanyId);

                // console.log(selectedCompany)
                if (selectedCompany) {
                    setDefaultCompanySession(selectedCompany, req.session);
                    res.sendStatus(200);
                } else {
                    console.error("Selected company not found");
                    res.status(404).send("Selected company not found");
                }
            } catch (error) {
                console.error("Error in /storeSelectedCompany:", error);
                res.status(500).send("Internal Server Error");
            }
        });

        app.get("/company/manage-company", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyController.viewCompany(req, res);
        });

        app.post("/company/add-company", upload.single("company_logo"), async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyController.addCompany(req, res);
        });

        app.post("/company/update-company", upload.single("company_logo"), async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyController.updateCompany(req, res);
        });

        app.post("/company/delete-company", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyController.deleteCompany(req, res);
        });

        app.get("/company/manage-branch", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageBranchController.viewBranch(req, res);
        });

        app.get("/company/fetch-branch/:id", async (req, res) => {
            // const callback = await tokenController.auth(req, res);
            // if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageBranchController.fetchBranch(req, res);
        });
        app.post("/company/update-branch", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageBranchController.updateBranch(req, res);
        });

        app.post("/company/add-branch", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageBranchController.addBranch(req, res);
        });

        app.post("/company/insert-branch-data", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageBranchController.insertBranchData(req, res);
        });

        // /company/manage-order
        app.get("/company/manage-order", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyReportController.manageOrder(req, res);
        })

        app.get("/company/fetch-orders-report", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyReportController.fetchOrder(req, res);
        })

        app.get("/company/revenue-report", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyReportController.revenueReport(req, res);
        })

        app.get("/company/get-revenue-data", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyReportController.getRevenueData(req, res);
        })

        app.get("/company/item-revenue-report", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyReportController.itemRevenueReport(req, res);
        })

        app.get("/company/get-item-revenue-data", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            companyReportController.getItemRevenueData(req, res);
        })

        app.get("/company/renew-subscription", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            renewSubsccriptionController.renewSubscription(req, res);
        })

        app.post("/company/renewBranch", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            renewSubsccriptionController.renewBranch(req, res);
        });

        app.post("/company/renew-handlePaymentSuccess", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            renewSubsccriptionController.handlePaymentSuccess(req, res);
        })


        app.get("/company/manage-category", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageCategoryController.viewCategory(req, res);
        });

        app.post("/company/add-category", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageCategoryController.addCategory(req, res);
        });

        app.post("/company/update-category", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageCategoryController.updateCategory(req, res);
        });

        app.get("/company/category-activeAndDeactive", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageCategoryController.activeAndDeactive(req, res);
        });

        app.post("/company/delete-category", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageCategoryController.deleteCategory(req, res);

        });

        app.get("/company/manage-sub-category", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageSubCategoryController.viewSubCategory(req, res);
        });

        app.post("/company/add-sub-category", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageSubCategoryController.addSubCategory(req, res);
        });

        app.post("/company/update-sub-category", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageSubCategoryController.updateSubCategory(req, res);
        });

        app.get("/company/sub-category-activeAndDeactive", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageSubCategoryController.activeAndDeactive(req, res);
        });

        app.post("/company/delete-sub-category", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageSubCategoryController.deleteSubCategory(req, res);

        });


        app.get("/company/manage-food", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageFoodController.viewFood(req, res);
        });

        app.post("/company/add-food-item", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageFoodController.addFoodItem(req, res);
        });

        app.get("/company/food-item-activeAndDeactive", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageFoodController.activeAndDeactive(req, res);
        });

        app.post("/company/update-food-item", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageFoodController.updateFoodItem(req, res);
        });

        app.post("/company/delete-food-item", async (req, res) => {
            const callback = await tokenController.auth(req, res);
            if (!handleAuthRedirect(callback, res, "/home/auth-login")) return;

            manageFoodController.deleteFoodItem(req, res);
        });

        app.get("/logout", async (req, res) => {
            req.session.destroy((err) => {
                if (err) {
                    console.error("Error destroying session:", err);
                    return res.status(500).json({error: "Internal Server Error"});
                }

                // Clear the session cookie
                res.clearCookie("jwt");

                console.log("'Logout successful'");
                isDefaultCompanySet = true;
                // res.json({ message: 'Logout successful' });
                res.redirect("/home/auth-login");
            });
        });
    },
};