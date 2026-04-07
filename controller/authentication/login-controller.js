const { isEqual } = require("lodash");

module.exports = {
  loginUser: async (req, res) => {
    try {
      await matchUser(req, res);
    } catch (error) {
      console.error("loginUer Error: " + error);
    }
  },
};

const matchUser = async function (req, res) {
  try {
    let data = await usersSchema.findOne({ email_id: req.body.email_id });

    if (data) {
      const salt = await bcrypt.genSalt(10);
      const userEnteredPasword = await bcrypt.hash(req.body.password, salt);
      bcrypt.compare(req.body.password, data.password, async (err, isMatch) => {
        if (isMatch) {
          await saveToken(req, res, data);
          if (_.isEqual(data.role_name, "A")) {
            res.redirect("/admin/dashboard");
          } else if (_.isEqual(data.role_name, "O")) {
            res.redirect("/company/dashboard");
          } else if (_.isEqual(data.role_name, "B")) {
            res.redirect("/branch/dashboard");
          }
        } else {
          alertMessage = "Password is not match";
          await setErrorAlert(req, res, alertMessage);
          res.redirect("/home/auth-login");
        }
      });
    } else {
      alertMessage = "Please register your self. User not found.";
      await setErrorAlert(req, res, alertMessage);
      res.redirect("/home/auth-login");
    }
  } catch (error) {
    console.log("matchUser: " + erroe);
  }
};

//Token
const saveToken = async function (req, res, data) {
  try {
    //call generateAuthToken() in user-model file
    const token = await data.generateAuthToken();

    data = new tokenSchema({
      token: token,
      user_id: data._id.toString(),
    });

    const result = await data.save();
    saveCookie(req, res, token);
  } catch (error) {
    console.log("saveToken Error:" + error);
  }
};

const saveCookie = async function (req, res, token) {
  try {
    res.cookie("jwt", token, {
      // expires: new Date(Date.now() + 1000000),
      expires: new Date(Date.now() + 60 * 60 * 1000),
      httpOnly: true,
    });
  } catch (error) {
    console.log("saveCookie Error: " + error);
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

// Session

// req.session.user = {
//   token: token,
// };
// console.log(req.session.user);
