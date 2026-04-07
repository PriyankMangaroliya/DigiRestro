module.exports = {
  homeSubscription: async (req, res) => {
    try {
      const subscriptions = await subscriptionSchema.find({ is_active: true });
      res.render(`${appPath}/home/index.ejs`, { subscriptions });
    } catch (error) {
      console.log("homeSubscription: " + error);
    }
  },
  contactUs: async (req, res) => {
    try {
      const data = new contactUsSchema(req.body);
      const result = await data.save();
      res.redirect("/home")
    } catch (error) {
      console.log("contactUs: " + error);
    }
  },
};
