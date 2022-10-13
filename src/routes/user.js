const express = require("express");
const router = express.Router();
const {
  signup,
  signin,
  signout,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  verifyUser,
  passwordReset,
  handleNewPassword,
} = require("../contollers/userController");
const { requireSignin, adminMiddleware } = require("../middlewares/auth");
const {
  signupUserSchema,
  signinUserSchema,
  updateUserSchema,
  passwordResetSchema,
  googleCaptchaVerifySchema,
  newPasswordSchema,
} = require("../middlewares/joi/user.-schema");

router.post("/signup", signupUserSchema, signup);
router.post("/signin", signinUserSchema, signin);
router.post("/signout", requireSignin, signout);
router.get("/", requireSignin, adminMiddleware, getUsers);
router.get("/:id", requireSignin, getUser);
router.patch("/:id", requireSignin, updateUserSchema, updateUser);
router.delete("/:id", requireSignin, deleteUser);
router.post("/reset-password", passwordResetSchema, passwordReset);
router.post("/new-password/:id/:token", newPasswordSchema, handleNewPassword);
router.post("/verify", googleCaptchaVerifySchema, verifyUser);

module.exports = router;
