// Authentication
tokenController = module.export = require("../controller/token-controller");
loginController = module.exports = require("../controller/authentication/login-controller");
registrationController = module.exports = require("../controller/authentication/registration-controller")
subscriptionController = module.exports = require("../controller/admin/subscription-controller/subscription-controller")
changePasswordController = module.exports = require("../controller/authentication/change-password-controller")

// Admin Controller
ownerController = module.exports = require("../controller/admin/owner-controller/owner-controller")
emailController = module.exports = require("../controller/email-controller/email-controller")
homeController = module.exports = require("../controller/home-controller/home-subscription-controller")
inquiryController = module.exports = require("../controller/admin/inquiry-controller/inquiry-controller")
companyControllerAdmin = module.exports = require("../controller/admin/company-controller/view-company")
profileController = module.exports = require("../controller/admin/profile-controller/profile-controller")
reportController = module.exports = require("../controller/admin/reports-controller/report-controller")
dashboardController = module.exports = require("../controller/admin/dashboard-controller/dashboard-controller");
branchController = module.exports = require("../controller/admin/branch-controller/branch-controller");

// Company Controller
companyDashboardController = module.exports = require("../controller/company/company-dashboard-controller")
companyController = module.exports = require("../controller/company/manage-company-controller")
manageBranchController = module.exports = require("../controller/company/manage-branch-controller")
manageCategoryController = module.exports = require("../controller/company/manage-category-controller")
manageSubCategoryController = module.exports = require("../controller/company/manage-sub-category-controller")
manageFoodController = module.exports = require("../controller/company/manage-food-controller")
companyReportController = module.exports = require("../controller/company/report-controller")
checkSubscriptionExpiry = module.exports = require("../controller/subscription-controller/check-subscription-expiry")
renewSubsccriptionController = module.exports = require("../controller/company/renew-subscription-controller")
companyProfileController = module.exports = require("../controller/company/company-profile-controller")

// Branch Controller
branchDashboardController = module.exports = require("../controller/branch/branch-dashboard-controller")
branchAreaController = module.exports = require("../controller/branch/branch-area-controller")
branchTableController = module.exports = require("../controller/branch/branch-table-controller")
assignTableController = module.exports = require("../controller/branch/assign-table-controller")
orderController = module.exports = require("../controller/branch/order-controller")
kotController = module.exports = require("../controller/branch/kot-controller")
branchProfileController = module.exports = require("../controller/branch/branch-profile-controller")

// loginController.bind_Url();
// module.exports = {tokenController};


