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
    // Store company data in session including logo
    req.body.company_logo = req.file ? req.file.filename : null;
    req.session.companyData = req.body;
    res.status(200).send({ success: true, message: "Company details stored in session" });
  },
  registerBranch: async (req, res) => {
    // Store branch data in session including image
    req.body.image = req.file ? req.file.filename : null;
    req.session.branchData = req.body;

    console.log("Subscription ID for Payment: ", req.session.subscriptionID);

    const subscriptionDetails = await subscriptionSchema.find(
      { _id: req.session.subscriptionID },
      { price: 1, plan_name: 1, _id: 0 }
    );

    if (subscriptionDetails.length === 0) {
      return res.status(400).send({ success: false, message: "Subscription plan not found." });
    }

    const amount = subscriptionDetails[0].price * 100;
    const options = {
      amount: amount,
      currency: "INR",
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "Order Created",
          order_id: order.id,
          amount: amount,
          key_id: process.env.RAZORPAY_ID_KEY,
          description: subscriptionDetails[0].plan_name,
          name: req.session.userData.name,
          email: req.session.userData.email_id,
          contact: req.session.userData.mobile_no
        });
      } else {
        console.error("Razorpay Error: ", err);
        res.status(400).send({ success: false, msg: "Failed to initiate payment." });
      }
    });
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
        // OTP matched, just signal success to move to next step
        Toast.fire({ icon: 'success', title: 'Email verified successfully' });
        res.status(200).send({
          success: true,
          message: "Email verified successfully"
        });
      } else {
        console.log("OTP is Not matched");
        res.status(400).send({
          success: false,
          message: "The OTP you entered is incorrect. Please try again."
        });
      }
    } else {
      res.status(400).send({
        success: false,
        message: "Session expired. Please restart the registration process."
      });
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
          message: "Invalid OTP. Please check and try again."
        });
        console.log("OTP is Not matched");
      }
  },
  registerPurchasedSubscription: async (req, res) => {
    try {
      console.log("Final Registration Started");
      const { userData, companyData, branchData, subscriptionID } = req.session;

      if (!userData || !companyData || !branchData || !subscriptionID) {
        console.error("Missing session data for final registration");
        return res.redirect("/home");
      }

      // 1. Create User
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      userData.is_active = true;
      const userDoc = new usersSchema(userData);
      const userResult = await userDoc.save();
      const userID = userResult._id;

      // 2. Create Company
      companyData.user_id = userID;
      const companyDoc = new companySchema(companyData);
      const companyResult = await companyDoc.save();
      const companyID = companyResult._id;

      // 3. Create Branch
      branchData.user_id = userID;
      branchData.company_id = companyID;
      const branchDoc = new branchSchema(branchData);
      const branchResult = await branchDoc.save();
      const branchID = branchResult._id;

      // 4. Create Subscription Record
      const plan = await subscriptionSchema.findById(subscriptionID);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.duration);

      const purchasedData = {
        plan_id: subscriptionID,
        branch_id: branchID,
        duration: plan.duration,
        price: plan.price,
        start_date: startDate,
        end_date: endDate,
      };
      const subDoc = new purchaseSubscriptionSchema(purchasedData);
      await subDoc.save();

      // Success!
      console.log("Registration Complete for: ", userData.email_id);
      
      // Cleanup session
      delete req.session.userData;
      delete req.session.companyData;
      delete req.session.branchData;
      delete req.session.subscriptionID;
      delete req.session.otp;

      res.redirect("/home/auth-login");

    } catch (error) {
      console.error("Error in final registration: ", error);
      res.redirect("/home?error=registration_failed");
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
    res.status(200).send({ success: true, message: "Company details saved" });
  } else {
    res.status(400).send({ success: false, message: "Could not save company details." });
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
      req.body.image = req.file ? req.file.filename : null; // Store file name in session
      req.session.userData = req.body;
      req.session.subscriptionID = req.body.id; // Correct place to capture plan ID
      console.log("Pruthil: ", req.body);
      res.status(200).json({ success: true, message: "OTP sent to your email" });
    } else {
      res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
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
    res.status(409).json({ success: false, message: globalMessage });
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
