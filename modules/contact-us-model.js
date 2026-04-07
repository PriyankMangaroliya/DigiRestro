const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email_id: {
      type: String,
      required: true,
    },
    mobile_no: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    replied:{
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default: new Date(),
    },
  },
  { collection: "contact_us" }
);

const contactUs = mongoose.model("contact_us", contactUsSchema);

module.exports = contactUs;