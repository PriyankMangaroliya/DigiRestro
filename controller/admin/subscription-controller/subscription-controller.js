const mongoose = require("mongoose");
module.exports = {
  // Insert data in subcsription_plan
  addSubscription: async (req, res) => {
    try {
      req.body.price = parseInt(req.body.price);
      req.body.duration = parseInt(req.body.duration);

      const existingData = await subscriptionSchema.find({
        $and: [
          { plan_name: req.body.plan_name },
          { duration: req.body.duration },
          { price: req.body.price },
        ],
      });

      if (!_.isEmpty(existingData)) {
        req.session.Error = "Subscription with similar data already exists";
        return res.redirect("/admin/view-subscription");
      }

      const newSubscription = new subscriptionSchema(req.body);
      const result = await newSubscription.save();

      if (result) {
        req.session.Success = "Subscription added successfully!";
      } else {
        req.session.Error = "Failed to save subscription";
      }
      res.redirect("/admin/view-subscription");
    } catch (error) {
      console.error(error);
      req.session.Error = "Internal Server Error";
      res.redirect("/admin/view-subscription");
    }
  },
  viewSubscription: async (req, res) => {
    try {
      const subscriptions = await subscriptionSchema
        .find()
        .sort({ created_at: -1 });
      res.render(`${appPath}/admin/master-subscription.ejs`, { subscriptions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  //Fetch data from subscription_plan
  editSubsciption: async (req, res) => {
    try {
      const subscription = await subscriptionSchema.findOne({
        _id: new mongoose.Types.ObjectId(req.query.id),
      });

      res.render(`${appPath}/admin/edit-subscription.ejs`, { subscription });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  //Update data from subscription_plan in DB
  updateSubscription: async (req, res) => {
    try {
      req.body.price = parseInt(req.body.price);
      req.body.duration = parseInt(req.body.duration);

      const result = await subscriptionSchema.updateOne(
        { _id: req.body.plan_id },
        {
          $set: {
            plan_name: req.body.plan_name,
            description: req.body.description,
            duration: req.body.duration,
            price: req.body.price,
          },
        }
      );

      if (result.modifiedCount > 0) {
        req.session.Success = "Subscription updated successfully!";
      } else {
        req.session.Error = "No changes were made or subscription not found.";
      }
      res.redirect("/admin/view-subscription");
    } catch (error) {
      console.error(error);
      req.session.Error = "Internal Server Error";
      res.redirect("/admin/view-subscription");
    }
  },
  //Delete data from subscription_plan in DB
  deleteSubsciption: async (req, res) => {
    try {
      const subscriptionId = req.query.id;
      // const subscription = await subscriptionSchema.deleteOne({_id: new mongoose.Types.ObjectId(subscriptionId)});
      const subscription = await subscriptionSchema.deleteOne(
        { _id: new mongoose.Types.ObjectId(subscriptionId) }
      );
      if (subscription.acknowledged === true) {
        res
          .status(200)
          .json({
            success: true,
            message: "Subscription deleted successfully",
          });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Subscription not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  activeAndDeactive: async (req, res) => {
    try {
      const result = await subscriptionSchema.updateOne(
        { _id: req.query.id },
        { $set: { is_active: req.query.value } }
      );
      if (result.modifiedCount == 1) {
        req.session.Success = `Subscription status ${req.query.value == 'true' ? 'activated' : 'deactivated'} successfully!`;
      } else {
        req.session.Error = "Failed to update status.";
      }
      res.redirect("/admin/view-subscription");
    } catch (error) {
      console.log("In Admin activeAndDeactive Error: ", error);
      req.session.Error = "Internal Server Error";
      res.redirect("/admin/view-subscription");
    }
  },
  viewPurchasedSubscriptionPlan: async (req, res) => {
    const today = new Date();
    const purchasedPlanData = await purchaseSubscriptionSchema.aggregate([
      {
        $sort: { start_date: -1 }
      },
      {
        $lookup: {
          from: "subscription_plan",
          localField: "plan_id",
          foreignField: "_id",
          as: "plan"
        }
      },
      {
        $lookup: {
          from: "branch",
          localField: "branch_id",
          foreignField: "_id",
          as: "branch"
        }
      },
      {
        $unwind: "$branch", // Unwind the userDetails array
      },
      {
        $unwind: "$plan", // Unwind the userDetails array
      },
      {
        $project: {
          _id: 1,
          duration: 1,
          price: 1,
          is_active: 1,
          start_date: 1,
          end_date: 1,
          branch_name: "$branch.branch_name", // Project the user_name field from userDetails
          plan_name: "$plan.plan_name", // Project the user_name field from userDetails
        },
      }
    ]);

    console.log("I am: ", purchasedPlanData);


    // const purchasedPlanData = await purchaseSubscriptionSchema.find({end_date:{$gt:today}});
    res.render(`${appPath}/admin/view-purchased-subscription.ejs`, { purchasedPlanData });

    // console.log(purchasedPlanData.length);
    // console.log(purchasedPlanData);
  },
};
