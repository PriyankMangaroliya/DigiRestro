const userAPI = require("./api/user/users");
userAPI.bind_Url();

const homeAPI = require("./api/home/home")
homeAPI.bind_Url();

const adminAPI = require("./api/admin/admin")
adminAPI.bind_Url();

const companyAPI = require("./api/company/company")
companyAPI.bind_Url();

const companyCharts = require("./api/company/companyChart")
companyCharts.bind_Url();

const branchAPI = require("./api/branch/branch")
branchAPI.bind_Url();

const branchCharts = require("./api/branch/branchChart")
branchCharts.bind_Url();