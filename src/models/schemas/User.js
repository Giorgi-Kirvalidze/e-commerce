const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { ROLE } = require("../../constants/userConstants");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: [ROLE.USER, ROLE.ADMIN],
      default: ROLE.USER,
    },
    phone: {
      type: String,
      required: true,
    },
    profilePicture: { type: String },
  },
  { timestamps: true }
);

userSchema.methods.authenticate = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
