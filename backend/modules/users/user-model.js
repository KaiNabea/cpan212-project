const mongoose = require("mongoose");
const {encodePassword} = require("../../shared/password-utils")

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    address: String,
    createdAt: { type: Date, default: Date.now() },
  },
  { versionKey: false }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }
  try {
    const hashed = await encodePassword(this.password)
    this.password = hashed
    next()
  } catch (err) {
    next(err)
  }
});

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;