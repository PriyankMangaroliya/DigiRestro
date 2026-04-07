module.exports = {
  changePassword: async (req, res) => {
    try {
      const userId = await tokenController.getUserID(req, res);
      const user = await usersSchema.findById(userId).select("password");

      if (!user) {
        req.session.Error = "User not found.";
        return res.redirect("/branch/profile");
      }

      if (req.body.new_password !== req.body.confirm_password) {
        req.session.Error = "New password and confirm password do not match.";
        return res.redirect("/branch/profile");
      }

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(req.body.new_password, salt);
        const updateResult = await usersSchema.updateOne(
          { _id: userId },
          { $set: { password: hashedNewPassword } }
        );

        if (updateResult.acknowledged) {
          req.session.Success = "Password changed successfully. Please login again.";
          res.redirect("/home/auth-login");
        } else {
          req.session.Error = "Failed to update password.";
          res.redirect("/branch/profile");
        }
      } else {
        req.session.Error = "Incorrect old password.";
        res.redirect("/branch/profile");
      }
    } catch (error) {
      console.error("changePassword error: ", error);
      req.session.Error = "An internal error occurred.";
      res.redirect("/branch/profile");
    }
  },

  changePasswordAgain: async (req, res) => {
    try {
      console.log(req.body);
      console.log(req.session.email);

      if (req.body.new_password == req.body.confirm_password) {
        
          const salt = await bcrypt.genSalt(10);
          const userEnteredOldPasword = await bcrypt.hash(req.body.new_password, salt);
          // bcrypt.compare(
          //   req.body.password,
          //   usersData[0].password,
          //   async (err, isMatch) => {
          //     if (isMatch) {
                const userEnteredNewPasword = await bcrypt.hash(req.body.new_password, salt);
                const upadtePassword = await usersSchema.updateOne(
                    {email_id: req.session.email},
                    {
                        $set:{
                            password:userEnteredNewPasword
                        }
                    }
                );
                if(upadtePassword.acknowledged){
                    res.redirect("/home/auth-login");
                }
              // } else {
              //   console.log("Password is not matched");
              // }
          //   }
          // );
        
      }else{
        console.log("New password and confirm password is not same");
      }
    } catch (error) {
      console.log("changePassword error: ", error);
    }
  },
};
