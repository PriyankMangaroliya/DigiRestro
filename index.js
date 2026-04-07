require("./config");
require("dotenv").config();
//Import schema
const usersModel = require("./modules/user-model");
const subscriptionModel = require("./modules/subscription-model");
const companyModel = require("./modules/company-model");
const foodCategoryModel = require("./modules/food-category-model");
const foodSubCategoryModel = require("./modules/food-sub-category-model");
const foodItemModel = require("./modules/food-item-model");
const foodSubItemModel = require("./modules/food-sub-item");
const purchaseSubscriptionModel = require("./modules/purchase-subscription-model");
const contactUsModel = require("./modules/contact-us-model");
const branchModel = require("./modules/branch-module");
const areaModel = require("./modules/area-model");
const tableOfArea = require("./modules/table-of-area-model");
const orderModel = require("./modules/order-model");

usersSchema = module.exports = usersModel.users;
tokenSchema = module.exports = usersModel.token;
subscriptionSchema = module.exports = subscriptionModel;
companySchema = module.exports = companyModel;
foodCategorySchema = module.exports = foodCategoryModel;
foodSubCategorySchema = module.exports = foodSubCategoryModel;
foodItemSchema = module.exports = foodItemModel;
foodSubItemSchema = module.exports = foodSubItemModel;
purchaseSubscriptionSchema = module.exports = purchaseSubscriptionModel;
contactUsSchema = module.exports = contactUsModel;
branchSchema = module.exports = branchModel;
areaSchema = module.exports = areaModel;
tableOfAreaSchema = module.exports = tableOfArea;
orderSchema = module.exports = orderModel;
// module.exports = {users, token};

nodemailer = module.exports = require("nodemailer");
json = module.exports = require("body-parser");
jwt = module.export = require("jsonwebtoken");
multer = module.exports = require("multer");
schedule = module.exports = require("node-schedule");

// schedule.scheduleJob("*", async () => {
schedule.scheduleJob("* * * * *", async () => {
  // await chewckSubscriptionExpiry();
  await checkSubscriptionExpiry();
  // await sendSubscriptionExpiryReminder();
});
const express = require("express");
const Razorpay = require("razorpay");
app = module.exports = express();

bcrypt = module.exports = require("bcrypt");

session = module.exports = require("express-session");

mongoose = module.exports = require("mongoose");

// json = module.exports = require("body-parser");
log = module.exports = require("console");
off = module.exports = require("process");

_ = module.exports = require("lodash");

cookieParser = module.exports = require("cookie-parser");

path = module.exports = require("path");
appPath = module.exports = path.join(__dirname, "views");

// Middleware

app.use(express.static(appPath));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 1000 * 60 * 30,
    },
  })
);
app.set("view engine", "ejs");

globalMessage = module.exports = null;
emailMatch = module.exports = false;
phoneMatch = module.exports = false;

app.listen(4000, function () {
  console.log("Server is running 4000");
});

require("./settings/controller-setting");
require("./settings/api-setting");

// Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Restricted
// Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Unrestricted