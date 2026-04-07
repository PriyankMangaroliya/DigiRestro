const { default: mongoose } = require("mongoose");
const { generate } = require("otp-generator");
const Razorpay = (module.exports = require("razorpay"));
// var sharedData = null;
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
module.exports = {
  registerUser: async (req, res) => {
    // sharedData = req.body;
    // console.log("1");

    await checkAlresdyUserExsist(req, res);
    // console.log("2");
  },
  registerCompany: async (req, res) => {
    await saveCompany(req, res);
  },
  registerBranch: async (req, res) => {
    // console.log("Branch: " , req.body);
    console.log("USer session:", req.session.userID);
    console.log("Company session:", req.session.companyID);
    if (
      !(
        _.isUndefined(req.session.companyID) ||
        _.isUndefined(req.session.userID)
      )
    ) {
      const userTableInstance = {
        name: req.body.name,
        email_id: req.body.email_id,
        mobile_no: req.body.mobile_no,
        image: req.body.image,
        password: req.body.password,
      };
      userTableInstance.role_name = "B";
      const branchTableInstance = {
        branch_name: req.body.branch_name,
        street_address: req.body.street_address,
        country: req.body.country,
        state: req.body.state,
        city: req.body.city,
        gst_no: req.body.gst_no,
        pin_code: req.body.pin_code,
      };
      req.body = userTableInstance;
      console.log("sdsdsssdsd: ", branchTableInstance);
      const result = await saveUser(req, res);
      if (result) {
        console.log("Branch user: ", result);

        req.body = branchTableInstance;
        req.body.company_id = req.session.companyID;
        req.body.user_id = req.session.userID;
        console.log("Branch data: ", req.body);
        await saveBranch(req, res);
      }
    } else {
      console.log("Filed to register");
    }
  },
  resendOTP: async (req, res) => {
    console.log("Session userData: ", req.session.userData);
    req.body = req.session.userData;
    console.log("req.body: ", req.body);
    const getOTP = await sendMail(req, res);
    await setOTPSession(req, res, getOTP);
    res.redirect("/home/otp");
  },
  userOtpVerification: async (req, res) => {
    if (
      !(
        _.isNull(req.session.userData) ||
        _.isUndefined(req.session.userData) ||
        _.isEmpty(req.session.userData)
      )
    ) {
      const result = await otpVerification(req, res);
      if (result) {
        // console.log("Yesssssssssss", enteredOTP);
        console.log("session data :", req.session.otp);
        console.log("User Session data is: ", req.session.userData);
        req.body = req.session.userData;
        const result = await saveUser(req, res);
        if (result) {
          req.session.subscriptionID = req.session.userData.id;
          console.log("subscription ID: ", req.session.subscriptionID);

          res.status(200).send({
            success: true,
          });
        } else {
          res.status(400).send({
            success: false,
          });
        }
      } else {
        console.log("OTP is Not matched");
      }
    }
  },
  userOtpVerify: async (req, res) => {
    
    const result = await otpVerification(req, res);
      if (result) {
        // console.log("Yesssssssssss", enteredOTP);
        
        console.log("OTP is matched");
        
        res.status(200).send({
          success: true,
        });
        // res.render(`${appPath}/home/auth-reset-password.ejs`);
      } else {
        res.status(400).send({
          success: false,
        });
        console.log("OTP is Not matched");
      }
  },
  registerPurchasedSubscription: async (req, res) => {
    console.log("registerPurchasedSubscription: ", req.session.subscriptionID);
    console.log("registerPurchasedSubscription", req.session.branchID);
    if (
      !(
        _.isUndefined(req.session.subscriptionID) ||
        _.isUndefined(req.session.branchID)
      )
    ) {
      const findSubscriptionData = await subscriptionSchema.find(
        { _id: req.session.subscriptionID },
        { duration: 1, price: 1, _id: 0 }
      );
      console.log(findSubscriptionData);
      const startDate = new Date();
      const endDate = new Date();

      // console.log(endDate.getMonth());
      // console.log(findSubscriptionData[0].duration);
      endDate.setMonth(endDate.getMonth() + findSubscriptionData[0].duration);
      // console.log(endDate);

      // console.log(startDate);
      const purchasedData = {
        plan_id: req.session.subscriptionID,
        branch_id: req.session.branchID,
        duration: findSubscriptionData[0].duration,
        price: findSubscriptionData[0].price,
        start_date: startDate,
        end_date: endDate,
      };
      console.log(purchasedData);
      const data = new purchaseSubscriptionSchema(purchasedData);
      const result = await data.save();
      if (!(_.isUndefined(result) || _.isNull(result) || _.isEmpty(result))) {
        console.log("User ID:", req.session.userID);
        console.log("User ID:", req.session.branchID);
        console.log("User ID:", req.session.subscriptionID);
        const activeBranchUser = await usersSchema.updateOne(
          { _id: req.session.userID },
          { $set: { is_active: true } }
        );
        if (
          activeBranchUser.acknowledged &&
          activeBranchUser.modifiedCount == 1
        ) {
          console.log(activeBranchUser);
          console.log("branch ID:", req.session.branchID);
          var getUserId = await branchSchema.aggregate([
            {
              $match: {
                _id: new mongoose.Types.ObjectId(req.session.branchID),
              },
            },
            {
              $lookup: {
                from: "company", // Replace with the actual name of your company collection
                localField: "company_id",
                foreignField: "_id",
                as: "company",
              },
            },
            {
              $unwind: "$company",
            },
            {
              $project: {
                user_id: "$company.user_id",
                _id: 0, // Include only the user_id from the company collection
              },
            },
          ]);

          if (
            !(
              _.isUndefined(getUserId) ||
              _.isNull(getUserId) ||
              _.isEmpty(getUserId)
            )
          ) {
            const activeCompanyUser = await usersSchema.updateOne(
              { _id: getUserId[0].user_id.toString() },
              { $set: { is_active: true } }
            );
            if (
              activeCompanyUser.acknowledged &&
              activeCompanyUser.modifiedCount == 1
            ) {
              console.log(activeCompanyUser);
              console.log("You are totally activated");
              res.redirect("/home/auth-login");
            } else {
              console.log(
                "You Company login is not activated, Branch is activated"
              );
            }
          }
        }
      }
    } else {
      console.log(
        "Subscription and branch id is undefined: Now Please register from login page"
      );
    }
  },
  forgotPasswordOTP: async (req, res) => {
    const result = await usersSchema.find({ email_id: req.body.email_id });
    // console.log(result);
    if (!(_.isEmpty(result) || _.isUndefined(result) || _.isNull(result))) {
      // console.log("Not Null");
      const getOTP = await sendMail(req, res);
      // console.log("4");
      if (!_.isNull(getOTP)) {
        // console.log("Touy jhbsjdbc: " + getOTP);
        // req.session.otp = getOTP;
        // console.log("settttttt:", getOTP);
        await setOTPSession(req, res, getOTP);
        console.log("Session: " + req.session.otp);

        // console.log("Pruthil1111: ", req.body);
        
        req.session.email = req.body.email_id;
        console.log(req.session.email);
        res.redirect("/home/otp-verify");
      }
    } else {
      console.log("User not exist");
    }
    // await sendMail(req,res);
  },
};

const otpVerification = function (req, res) {
  const enteredOTP =
    req.body.first +
    req.body.second +
    req.body.third +
    req.body.fourth +
    req.body.fifth +
    req.body.sixth;

    console.log(enteredOTP);
    console.log(req.session.otp);

  if (_.isEqual(enteredOTP, req.session.otp)) {
    return true;
    // res.redirect("/home/company")
    // delete req.session.otp;
    // console.log("destroyed session data :", req.session.otp);

    // console.log("shared:", sharedData.id);

    // const subscriptionDetails = await subscriptionSchema.find(
    //   { _id: sharedData.id },
    //   { price: 1, _id: 0 }
    // );

    // const amount = subscriptionDetails[0].price * 100;
    // const options = {
    //   amount: amount,
    //   currency: "INR",
    // };

    // razorpayInstance.orders.create(options, (err, order) => {
    //   if (!err) {
    //     res.status(200).send({
    //       success: true,
    //       msg: "Subscriptions Created",
    //       order_id: order.id,
    //       amount: amount,
    //       key_id: process.env.RAZORPAY_ID_KEY,
    //     });
    //   } else {
    //     res
    //       .status(400)
    //       .send({ success: false, msg: "Something went wrong!" });
    //   }
    // });
  } else {
    return false;
  }
};
const saveBranch = async function (req, res) {
  console.log("save: ", req.body);
  const data = new branchSchema(req.body);
  const result = await data.save();
  if (!(_.isEmpty(result) || _.isNull(result) || _.isUndefined(result))) {
    req.session.branchID = result._id.toString();
    console.log("Subscription ID in saveBranch: ", req.session.subscriptionID);
    const subscriptionDetails = await subscriptionSchema.find(
      { _id: req.session.subscriptionID },
      { price: 1, _id: 0 }
    );

    const amount = subscriptionDetails[0].price * 100;
    const options = {
      amount: amount,
      currency: "INR",
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "Subscriptions Created",
          order_id: order.id,
          amount: amount,
          key_id: process.env.RAZORPAY_ID_KEY,
        });
      } else {
        res.status(400).send({ success: false, msg: "Something went wrong!" });
      }
    });
    // res.redirect("/home/auth-login");
  } else {
    console.log("Branch is not registered. Please do it from login");
  }
};

const saveCompany = async function (req, res) {
  // req.body = {
  //   company_name: req.body.company_name,
  // legal_name: req.body.legal_name,
  // user_id: req.session.userID,
  // company_logo: req.body.company_logo
  // }
  req.body.user_id = req.session.userID;
  const data = new companySchema(req.body);
  const result = await data.save();
  if (!(_.isNull(result) || _.isUndefined(result) || _.isEmpty(result))) {
    // console.log("Company result is: " , result._id.toString());
    req.session.companyID = result._id.toString();
    res.redirect("/home/branch");
  }
  // console.log("Company details is: ", req.body);
};

const checkAlresdyUserExsist = async function (req, res) {
  req.body.email_id = req.body.email_id.trim().toLowerCase();
  req.body.mobile_no = req.body.mobile_no.trim();
  req.body.role_name = "O";

  //Find same User exist or not
  var data = await usersSchema.find(
    {
      $or: [{ email_id: req.body.email_id }, { mobile_no: req.body.mobile_no }],
    },
    { email_id: 1, mobile_no: 1, _id: 0 }
  );

  // Lodash is used for check _.isUndefined()
  if (_.isUndefined(data) || _.isEmpty(data) || _.isNull(data)) {
    //Same User not found
    // console.log("3");
    const getOTP = await sendMail(req, res);
    // console.log("4");
    if (!_.isNull(getOTP)) {
      // console.log("Touy jhbsjdbc: " + getOTP);
      // req.session.otp = getOTP;
      console.log("settttttt:", getOTP);
      await setOTPSession(req, res, getOTP);
      req.session.userData = req.body;
      console.log("Pruthil: ", req.body);
      res.redirect("/home/otp");
    }

    //save User
    // await saveUser(req, res, data);
    // console.log("5");
  } else {
    // Same User found
    await sameUserFound(req, res, data);
  }
};

//sendMail
const sendMail = async function (req, res) {
  try {
    //Send mail
    // console.log("6");
    //Mail subject
    const mailSubject = "OTP";

    //Generate OTP
    const otp = generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    console.log("Generated OTP:", otp);
    // const mailText = `${otp}`;
    const mailText = `Your One Time Password (OTP) for registration is <b>${otp}</b>. This code is valid for <b>3 minutes</b>. Please do not share this code with anyone.`;

    // console.log("Emaillll:",req.body.email_id);
    console.log("req.body: ", req.body);
    if (
      !(_.isUndefined(req.body) || _.isNull(req.body) || _.isEmpty(req.body))
    ) {
      const sendEmailBool = await emailController.sendEmail(
        req.body.email_id,
        mailSubject,
        mailText
      );
      console.log("sendEmailBool:", sendEmailBool);
      if (sendEmailBool) {
        return otp;
      } else {
        return null;
      }
    } else {
      console.log("Sorry, Please fill the your information again.");
    }
    //call sendEmail from controller
  } catch (error) {
    console.log("Send email: " + error);
  }
};

const saveUser = async function (req, res) {
  try {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
    // console.log(req.file);
    // const imagePath = req.file;

    data = new usersSchema(req.body);

    const result = await data.save();
    // console.log("Result: " , result);
    // console.log(result);
    if (_.isNull(result) || _.isUndefined(result) || _.isEmpty(result)) {
      const alertMessage = "Sorry, Not registered. Please try again";

      await setErrorAlert(req, res, alertMessage);
      // res.redirect("/home/subscription");
      return false;
    } else {
      req.session.userID = result._id.toString();
      console.log("session userID: ", req.session.userID);
      count = 0;
      return true;
      // return result
      // res.redirect("/home/auth-login");
    }
  } catch (error) {
    console.log("saveUSer:" + error);
  }
};

const sameUserFound = async function (req, res, data) {
  try {
    data.forEach((user) => {
      if (user.email_id == req.body.email_id) {
        emailMatch = true;
      }
      if (user.mobile_no == req.body.mobile_no) {
        phoneMatch = true;
      }
    });
    if (emailMatch && phoneMatch) {
      emailMatch = false;
      phoneMatch = false;
      globalMessage =
        "My Dear, User already exist with the same Email and Phone number.";
    } else if (emailMatch) {
      emailMatch = false;
      globalMessage = "My Dear, User already exist with the same Email";
    } else if (phoneMatch) {
      phoneMatch = false;
      globalMessage = "My Dear, User already exist with the same Phone Number";
    }
    await setErrorAlert(req, res, globalMessage);
    res.redirect("/home/subscription");
  } catch (error) {
    console.log("sameUSerFound: " + error);
  }
};

const setOTPSession = async function (req, res, getOTP) {
  try {
    req.session.otp = getOTP;
  } catch (error) {
    console.log("setOTPSessionError: " + error);
  }
};

const setErrorAlert = function (req, res, alertMessage) {
  try {
    req.session.alert = true;
    req.session.alertMessage = alertMessage;
  } catch (error) {
    console.log("registration-controller: setErrorAlert: " + error);
  }
};
