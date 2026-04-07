// const users = require("../modules/user-model");
module.exports = {
  auth: async (req, res) => {
    try {
      const cookieToken = req.cookies.jwt;
      if (
        !(
          _.isUndefined(cookieToken) ||
          _.isNull(cookieToken) ||
          _.isEmpty(cookieToken)
        )
      ) {
        //   console.log(cookieToken);
        // console.log("Controller : " + cookieToken);

        const verifyUser = jwt.verify(cookieToken, process.env.TOKEN_KEY);

        // console.log("Id : " + verifyUser._id);

        const user = await tokenSchema.findOne({ user_id: verifyUser._id });

        // console.log("User : " + user);
        if (!(_.isUndefined(user) || _.isNull(user) || _.isEmpty(user))) {
          // console.log("Verified: ", verifyUser._id);

          // console.log("Id : " + verifyUser._id);
          const findRole = await usersSchema
            .findOne({ _id: verifyUser._id })
            .select({ role_name: 1, _id: 0 });
          // const findRole = await userSchema.findOne({_id: verifyUser._id});
          // console.log(findRole.role_name);

          return { callback: true, role_name: findRole.role_name };
          // next();
        } else {
          // console.log("User not found");
          // res.redirect("/sign-in");
          return false;
        }
        // console.log("Verified: ", JSON.stringify(verifyUser))
      } else {
        return false;
      }
    } catch (error) {
      res.send(error);
    }
  },
  getUserID: async (req, res) => {
    try {
      const cookieToken = req.cookies.jwt;
      const verifyUser = jwt.verify(cookieToken, process.env.TOKEN_KEY);
      if (
        !(
          _.isNull(verifyUser._id) ||
          _.isEmpty(verifyUser._id) ||
          _.isUndefined(verifyUser._id)
        )
      ) {
        return verifyUser._id;
      } else {
        return null;
      }
    } catch (error) {
      console.log("getUserID error: ", error);
    }
  },
  getBranchID: async (req, res) => {
    try {
      const cookieToken = req.cookies.jwt;
      const verifyUser = jwt.verify(cookieToken, process.env.TOKEN_KEY);
      if (
        !(
          _.isNull(verifyUser._id) ||
          _.isEmpty(verifyUser._id) ||
          _.isUndefined(verifyUser._id)
        )
      ) {
        const verifyBranchID = await branchSchema.findOne({
          user_id: verifyUser._id,
        });
        if (
          _.isNull(verifyBranchID._id) ||
          _.isEmpty(verifyBranchID._id) ||
          _.isUndefined(verifyBranchID._id)
        ) {
          return verifyBranchID._id;
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      console.log("getBranchID error: ", error);
    }
  },
};

// module.exports = {
//     auth: async (req, res, next) => {
//       try {
//         const cookieToken = req.cookies.jwt;
//       //   console.log(cookieToken);
//         console.log("Controller : " + cookieToken);
//         const verifyUser = jwt.verify(cookieToken, "polkiolkuhytghbnhytghbnhytredfrtg");

//         console.log("Id : " + verifyUser._id);
//         const user = await tokenSchema.findOne({ user_id: verifyUser._id });
//         console.log("User : " + user);

//         console.log("Verified: ", verifyUser._id);
//         // console.log("Verified: ", JSON.stringify(verifyUser))
//         next();
//       } catch (error) {
//         res.status(404).send(error);
//       }
//     },
//   };
