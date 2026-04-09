module.exports = {
  bind_Url: function () {
    app.get("/home", async (req, res) => {
      req.session.alert = false;
      // console.log(req.cookies.jwt); 
      // console.log(req.session.otp);
      // console.log(req.session.alert);
      homeController.homeSubscription(req, res);
    });

    app.get("/home/subscription", async (req, res) => {
      if (!(_.isUndefined(req.query.id) || _.isNull(req.query.id))) {
        try {
          const decodedId = Buffer.from(req.query.id, 'base64').toString('utf-8');
          const plan = await subscriptionSchema.findById(decodedId);
          res.render(`${appPath}/home/registration-wizard.ejs`, {
            session: req.session,
            decodedId: decodedId,
            subscriptionTitle: plan ? plan.plan_name : 'Premium',
            id: req.query.id
          });
        } catch (error) {
          console.error("Error fetching plan:", error);
          res.redirect("/home");
        }
      } else {
        res.redirect("/home");
      }
    });
    app.get("/home/otp", (req, res) => {
      
      res.render(`${appPath}/home/auth-otp.ejs`);
    });

    app.get("/home/otp-verify", (req, res) => {
      
      res.render(`${appPath}/home/auth-otp-copy.ejs`);
    });

    app.get("/home/reset-password", (req, res) => {
      
      res.render(`${appPath}/home/auth-reset-password.ejs`);
    });

    app.get("/home/auth-login", (req, res) => {
      res.render(`${appPath}/home/auth-login.ejs`, { session: req.session });
    });

    app.get("/home/company", (req, res) => {
      res.render(`${appPath}/home/company.ejs`);   
    }); 
    app.get("/home/branch" , (req,res)=>{
      res.render(`${appPath}/home/branch.ejs`);
    })

    app.post("/home/contact-us", (req, res) => {
      homeController.contactUs(req, res);

      // res.render(`${appPath}/home/auth-login.ejs`);
    });
    
    app.get("/home/auth-forgot-password", (req, res) => {
      // homeController.contactUs(req, res);
      res.render(`${appPath}/home/auth-forgot-password.ejs`);
    });
  },
};
