const tokenController = require("../../token-controller");

module.exports = {
  profileDetails: async (req, res) => {
    try {
      const userId = await tokenController.getUserID(req, res);
      const usersData = await usersSchema
        .find({ _id: userId })
        .select("name email_id mobile_no image");
      // res.send(usersData);
      console.log(usersData);
      res.render(`${appPath}/admin/profile.ejs`, { usersData });
    } catch (error) {
      // res.send("viewProfile error:" , error);
      console.log("viewProfile error: ", error);
    }
  },
  fetchUserName: async (req, res) => {
    try {
      const userId = await tokenController.getUserID(req, res);
      const userData = await usersSchema.find({ _id: userId }).select("name image");
      res.status(200).send({
        success: true,
        userName: userData[0].name.toString(),
        userImage: userData[0].image || null,
        userInitial: userData[0].name.charAt(0).toUpperCase(),
      });
    } catch (error) {
      console.log("fetchUserName error: ", error);
    }
  },
  updateProfileDetails: async (req, res) => {
    try {
      const userId = await tokenController.getUserID(req, res);
      const updateUsersData = await usersSchema.updateOne(
        { _id: userId },
        {
          $set: {
            name: req.body.name,
            email_id: req.body.email_id,
            mobile_no: req.body.mobile_no
          },
        }
      );
      if(updateUsersData.acknowledged){
        req.session.Success = "Profile updated successfully!";
      } else {
        req.session.Error = "Failed to update profile.";
      }
      res.redirect("/admin/profile");
    } catch (error) {
      console.log("updateProfileDetails error: ", error);
      req.session.Error = "An error occurred while updating the profile.";
      res.redirect("/admin/profile");
    }
  },
};
