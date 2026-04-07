const contactUs = require("../../../modules/contact-us-model");

module.exports = {
  viewInquiry: async (req, res) => {
    try {
      // const viewInqData = await contactUsSchema.find();
      const viewInqData = await contactUsSchema.find().sort({ created_at: -1 });

      res.render(`${appPath}/admin/view-query.ejs`, { viewInqData });
    } catch (error) {
      console.log("viewInquiry Error:", error);
    }
  },
  sendEnquiryReply: async (req, res) => {
    try {
      const sendEmailBool = await emailController.sendEmail(
        req.body.email_id,
        req.body.subject,
        req.body.text
      );
      if (sendEmailBool) {
        await contactUsSchema.updateOne(
          { _id: req.body.id },
          { $set: { replied: true } }
        );
        req.session.Success = "Reply sent and status updated successfully!";
      } else {
        req.session.Error = "Failed to send email. Please try again.";
      }
      res.redirect("/admin/view-query");
    } catch (error) {
      console.log("sendEnquiryReply Error:", error);
      req.session.Error = "An internal error occurred while sending the reply.";
      res.redirect("/admin/view-query");
    }
  },
};
