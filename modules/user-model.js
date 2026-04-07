const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

//User table
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email_id: { type: String, unique: true },
    mobile_no: { type: String, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    role_name: { type: String, required: true },
    is_active:{type:Boolean, default:false},
    deleted: { type: Boolean, default: false },
    created_at: { type: Date, default: new Date()},
    updated_at: { type: Date, default: new Date()},
    deleted_at: { type: Date, default: null},
  },
  { collection: "users" }
);

//Token table
const tokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  expiry_date:{type:Date, default: new Date()},
  user_id: { type: String, required: true },
});

//Generate token
userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.TOKEN_KEY);
    return token;
  } catch (error) {
    console.error("generateAuthToken" + error);
  }
};

const users = mongoose.model("users", userSchema);
const token = mongoose.model("token", tokenSchema);

module.exports = { users, token };

// tokenSchema.methods.generateAuth = async function () {
//   try {
//     const token = jwt.sign(
//       { _id: this._id },
//       process.env.TOKEN_KEY
//     );

//     // this.tokens = this.tokens.concat({ token: token });
//     await this.save();
//     console.log("Token 1 is: " + token);
//     return token;
//   } catch (error) {
//     res.send("Error page ");
//   }
// };

// module.exports = {
//   users: this.users,
//   token: this.token,
// };
// module.exports = mongoose.model("users", userSchema);
// module.exports = mongoose.model("token", tokenSchema);
