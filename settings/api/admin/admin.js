const viewCompany = require("../../../controller/admin/company-controller/view-company");
const profileController = require("../../../controller/admin/profile-controller/profile-controller");
const subscriptionController = require("../../../controller/admin/subscription-controller/subscription-controller");
const tokenController = require("../../../controller/token-controller");

module.exports = {
  bind_Url: function () {
    app.get("/admin/dashboard", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          req.session.alert = false;
          dashboardController.dashboardData(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/dashboard error: ", error);
      }
    });

    app.get("/admin/view-subscription", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.viewSubscription(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-subscription error: ", error);
      }
    });

    app.get("/admin/add-subscription", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          res.render(`${appPath}/admin/add-subscription.ejs`);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/add-subscription error: ", error);
      }
    });

    app.post("/admin/add-subscription", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.addSubscription(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/add-subscription error:" + error);
      }
    });

    app.get("/admin/subscription-plan", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.viewSubscription(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/add-subscription error:" + error);
      }
    });

    app.get("/admin/edit-subscription", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.editSubsciption(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/edit-subscription error: ", error);
      }
    });

    app.post("/admin/edit-subscription", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.updateSubscription(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/edit-subscription error: ", error);
      }
    });

    app.get("/admin/subscription-activeAndDeactive", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        subscriptionController.activeAndDeactive(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.post("/admin/delete-subscription", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          subscriptionController.deleteSubsciption(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/delete-subscription error: ", error);
      }
    });

    app.get("/admin/view-client", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          ownerController.viewClient(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-client error: ", error);
      }
    });

    app.get("/admin/view-specific-company", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          companyControllerAdmin.viewSpecificCompany(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-specific-company error: ", error);
      }
    });

    app.get("/admin/view-specific-branch", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          companyControllerAdmin.viewSpecificBranch(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-specific-branch error: ", error);
      }
    });

    app.get("/admin/view-company", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          companyControllerAdmin.viewCompany(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-company error: ", error);
      }
    });

    app.get("/admin/view-branch", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          branchController.viewBranch(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-branch error: ", error);
      }
    });

    app.get("/admin/view-query", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          inquiryController.viewInquiry(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        res.send("/admin/view-query error: ", error);
      }
    });

    app.get("/admin/profile", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        profileController.profileDetails(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/fetchUserName", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        profileController.fetchUserName(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.post("/admin/update-profile", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        profileController.updateProfileDetails(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/email-compose", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        res.render(`${appPath}/admin/email-compose.ejs`);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/email-read", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        res.render(`${appPath}/admin/email-read.ejs`);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/purchased-subscription", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        subscriptionController.viewPurchasedSubscriptionPlan(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/compose-email", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          const to = req.query.to;
          res.render(`${appPath}/admin/email-compose.ejs`, { to });
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        console.log("/admin/compose-email Error: " + error);
      }
    });

    app.post("/admin/send-enquiry-reply", async (req, res) => {
      try {
        const callback = await tokenController.auth(req, res);
        if (callback.callback && _.isEqual(callback.role_name, "A")) {
          inquiryController.sendEnquiryReply(req, res);
        } else {
          res.redirect("/home/auth-login");
        }
      } catch (error) {
        console.log("/admin/send-enquiry-reply error: ", error);
      }
    });

    app.post("/admin/change-password", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        changePasswordController.changePassword(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/revenue-chart", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        dashboardController.revenueChart(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/yearly-revenue-chart", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        dashboardController.yearlyRevenueChart(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/growth-chart", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        dashboardController.growthChart(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    // --- Subscription Report ---
    app.get("/admin/subscription-report", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        reportController.subscriptionReportPage(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/get-subscription-report", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        reportController.getSubscriptionData(req, res);
      } else {
        res.status(401).send({ success: false, message: "Unauthorized" });
      }
    });

    // --- Growth Report ---
    app.get("/admin/growth-report", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        reportController.growthReportPage(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/get-growth-report", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        reportController.getGrowthData(req, res);
      } else {
        res.status(401).send({ success: false, message: "Unauthorized" });
      }
    });

    // --- Client Report ---
    app.get("/admin/client-report", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        reportController.clientReportPage(req, res);
      } else {
        res.redirect("/home/auth-login");
      }
    });

    app.get("/admin/get-client-report", async (req, res) => {
      const callback = await tokenController.auth(req, res);
      if (callback.callback && _.isEqual(callback.role_name, "A")) {
        reportController.getClientReport(req, res);
      } else {
        res.status(401).send({ success: false, message: "Unauthorized" });
      }
    });
  },
};
