const User = require("../models/schemas/User");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const sendEmail = require("../middlewares/nodemailer/sendEmail");
const ejs = require("ejs");
const passwordResetTemplate = require("../views/index");

const { ROLE, USER_NOTIFICATIONS } = require("../constants/userConstants");
const { COMMON_NOTIFICATIONS } = require("../constants/commonConstants");

function _generateJwtToken(_id, role, expiresIn = "7d") {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn,
  });
}

function _hasAccessToResource(req, user) {
  const initiatorId = req.user._id;
  const documentId = user._id.toString();
  return initiatorId === documentId || req.user.role === ROLE.ADMIN;
}

exports.signup = async (req, res) => {
  const isRegistered = await User.findOne({ email: req.body.email });
  if (isRegistered) {
    return res.status(400).json({
      isSuccess: false,
      message: USER_NOTIFICATIONS.AUTH.FAILURE.EMAIL_EXISTS,
    });
  }
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).json({
      isSuccess: true,
      message: USER_NOTIFICATIONS.AUTH.SUCCESS.SIGNUP_SUCCESS,
      payload: { user },
    });
  } catch (e) {
    res.status(500).send({ isSuccess: false, message: e.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND,
      });
    }
    if (user) {
      const isMatch = await user.authenticate(req.body.password);
      if (isMatch) {
        const token = _generateJwtToken(user._id, user.role);
        res.status(200).json({
          isSuccess: true,
          message: USER_NOTIFICATIONS.AUTH.SUCCESS.SIGNIN_SUCCESS,
          payload: {
            token,
            user,
          },
        });
      } else {
        return res.status(400).json({
          isSuccess: false,
          message: USER_NOTIFICATIONS.AUTH.FAILURE.INVALID_CREDENTIALS,
        });
      }
    }
  } catch (e) {
    res.status(500).json({ isSuccess: false, message: e.message });
  }
};

// TODO req.logout is not a function err && req.session clearing Error
exports.signout = async (req, res) => {
  try {
    // redirect to homepage
    res.redirect("/");
  } catch (e) {
    return res.status(500).send({ isSuccess: false, message: e.message });
  }
};

/* requires signin */
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND,
      });
    }
    const hasAccess = _hasAccessToResource(req, user);
    if (hasAccess) {
      return res.status(200).send({
        isSuccess: true,
        message: USER_NOTIFICATIONS.SUCCESS.GET_USER_SUCCESS,
        payload: { user },
      });
    } else {
      return res.status(400).json({
        isSuccess: false,
        message: COMMON_NOTIFICATIONS.FAILURE.ADMIN_ACESS_DENIED,
      });
    }
  } catch (e) {
    res.status(500).json({ isSuccess: false, message: e.message });
  }
};

/* requires signin */
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND,
      });
    }
    const hasAccess = _hasAccessToResource(req, user);
    const isNewRoleAdmin = req.body.role === ROLE.ADMIN;
    const isInitiatorAdmin = req.user.role === ROLE.ADMIN;

    if (hasAccess) {
      if (isNewRoleAdmin) {
        if (!isInitiatorAdmin) {
          return res.status(400).json({
            isSuccess: false,
            message: COMMON_NOTIFICATIONS.FAILURE.ADMIN_ACESS_DENIED,
          });
        }
      }
    }
    const updates = Object.keys(req.body);
    updates.forEach((update) => (user[update] = req.body[update]));
    const updatedUser = await user.save();
    return res.json({
      isSuccess: true,
      message: USER_NOTIFICATIONS.CRUD.SUCCESS.UPDATE_USER_SUCCESS,
      payload: { updatedUser },
    });
  } catch (e) {
    res.status(500).json({ isSuccess: false, message: e.message });
  }
};

/* requires signin */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        isSuccess: false,
        message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND,
      });
    }
    const hasAccess = _hasAccessToResource(req, user);
    if (hasAccess) {
      await User.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        isSuccess: true,
        message: USER_NOTIFICATIONS.CRUD.SUCCESS.DELETE_USER_SUCCESS,
      });
    } else {
      return res.status(400).json({
        isSuccess: false,
        message: COMMON_NOTIFICATIONS.FAILURE.ADMIN_ACESS_DENIED,
      });
    }
  } catch (e) {
    res.status(500).send({ isSuccess: false, message: e.message });
  }
};

/* requires signin && admin middleware */
exports.getUsers = async (req, res) => {
  const limit =
    req.query.limit & (req.query.limit <= 100) ? parseInt(req.query.limit) : 10;
  let page = 0;
  if (req.query) {
    if (req.query.page) {
      req.query.page = parseInt(req.query.page);
      page = Number.isInteger(req.query.page) ? req.query.page : 0;
    }
  }
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .limit(limit)
      .skip(page * limit);

    res.status(200).send({
      isSuccess: true,
      message: USER_NOTIFICATIONS.CRUD.SUCCESS.GET_USERS_SUCCESS,
      payload: { users },
    });
  } catch (e) {
    res.status(500).send({ isSuccess: false, message: e.message });
  }
};

exports.passwordReset = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({
        isSuccess: false,
        message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND,
      });
    }
    const token = _generateJwtToken(user._id, user.role, "1h");
    const link = `${process.env.BASE_URL}/new-password/${user._id}/${token}`;

    ejs
      .renderFile(passwordResetTemplate.emails.resetPassword, {
        username: user.firstName + " " + user.lastName,
        resetLink: link,
      })
      .then((result) => {
        sendEmail(req.body.email, "Password reset", result);
        res.status(200).send({
          isSuccess: true,
          message: USER_NOTIFICATIONS.AUTH.SUCCESS.PASSWORD_RESET_CHECK_EMAIL,
        });
      })
      .catch(() => {
        res.status(400).json({
          isSuccess: false,
          message:
            COMMON_NOTIFICATIONS.FAILURE.EROR_WHILE_RENDERING_EMAIL_TEMPLATE,
        });
      });
  } catch (e) {
    res.status(500).send({ isSuccess: false, message: e.message });
  }
};

exports.handleNewPassword = async (req, res) => {
  try {
    const decodedUser = jwt.verify(req.params.token, process.env.JWT_SECRET);
    if (decodedUser._id === req.params.id) {
      const user = await User.findById(req.params.id);
      user.password = req.body.password;
      await user.save();
      return res.status(200).json({
        isSuccess: true,
        message: USER_NOTIFICATIONS.AUTH.SUCCESS.PASSWORD_RESET_SUCCESS,
      });
    } else {
      return res.status(400).json({
        isSuccess: false,
        message: USER_NOTIFICATIONS.AUTH.FAILURE.PASSWORD_RESET_FAILURE,
      });
    }
  } catch (e) {
    return res.status(500).json({
      isSuccess: false,
      message: e.message,
    });
  }
};

exports.verifyUser = async (req, res) => {
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;
  try {
    const { data } = await axios.get(verifyUrl);
    if (!data.success || data.score < 0.4) {
      return res.status(400).json({
        isSuccess: false,
        message: COMMON_NOTIFICATIONS.FAILURE.CAPTCHA_VERIFY_FAILURE,
        payload: {
          score: data.score,
        },
      });
    }
    return res.status(200).json({
      isSuccess: true,
      message: USER_NOTIFICATIONS.GOOGLE.SUCCESS.CAPTCHA_VERIFY_SUCCESS,
      payload: {
        score: data.score,
      },
    });
  } catch (e) {
    return res.status(500).json({
      isSuccess: false,
      message: USER_NOTIFICATIONS.GOOGLE.FAILURE.GOOGLE_CAPTCHA_INTERNAL_ERROR,
    });
  }
};
