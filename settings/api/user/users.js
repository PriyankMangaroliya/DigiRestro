const registrationController = require("../../../controller/authentication/registration-controller");
const {upload}  = require("../../../controller/company/company-helper")
// console.log(upload);
module.exports = {
  bind_Url: function () {
    // Authentication of users
    app.post("/login", async (req, res) => {
      loginController.loginUser(req, res);
    });

    app.post("/registration", upload.single('image'), async (req, res, next) => {
      // console.log(req.body);
      // console.log("File is: " , req.file);
      registrationController.registerUser(req, res);
    });

    app.post("/otpVerification", async(req,res)=>{
      registrationController.userOtpVerification(req, res);
    });

    app.post("/otpVerify", async(req,res)=>{
      registrationController.userOtpVerify(req, res);
    });

    app.get("/register-purchased-subscription" , async (req,res)=>{
      registrationController.registerPurchasedSubscription(req,res);
    });

    app.post("/register-company" , upload.single('image'), (req,res)=>{
      registrationController.registerCompany(req,res);
    });

    app.post("/register-branch", upload.single('image'), async (req,res)=>{
      registrationController.registerBranch(req,res);
    });

    app.post("/resendOTP",async(req,res)=>{
      registrationController.resendOTP(req,res);
    });
    
    app.post("/forgot-password-otp",async(req,res)=>{
      registrationController.forgotPasswordOTP(req,res);
    });

    app.post("/forgot-password",async(req,res)=>{
      changePasswordController.changePasswordAgain(req, res);
    });

    app.post("/session/destroy", (req, res) => {
      // console.log("destroyed");
      // console.log("Before: " , req.session.userData);
      // console.log("Befor: " , req.session.otp);
      // console.log("Befor: " , req.session.userID);
      // console.log("Befor: " , req.session.subscriptionID);
      delete req.session.userData;
      delete req.session.otp;
      // console.log("After: " , req.session.userData);
      // console.log("After: " , req.session.otp);
      // console.log("After: " , req.session.userID);
      // console.log("After: " , req.session.subscriptionID);
      // req.session.destroy();
      res.status(200).send("ok");
    });
  },
};

// Redirect to the login page else execte next code
// function checkSession(req, res, next) {
//   if (!req.session.user) {
//     signIn(req, res);
//   } else {
//     // console.log(`Retrieve Dashboard Session: ${JSON.stringify(req.session.user.token)} `);
//     // const replace = JSON.stringify(req.session.user.token).replace(/^"(.*)"$/, '$1');
//     // console.log(replace);
//     // const verifyUser = jwt.verify(replace, "polkiolkuhytghbnhytghbnhytredfrtg");
//     // console.log(verifyUser._id);
//     next();
//   }
// }
