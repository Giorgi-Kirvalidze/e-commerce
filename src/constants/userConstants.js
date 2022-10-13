const ROLE = {
  ADMIN: "admin",
  USER: "user",
};

const USER_NOTIFICATIONS = {
  AUTH: {
    SUCCESS: {
      SIGNUP_SUCCESS: "Signup success.",
      SIGNIN_SUCCESS: "Signin success.",
      PASSWORD_RESET_CHECK_EMAIL: "Check email for password reset.",
      PASSWORD_RESET_SUCCESS: "Passowrd reset success.",
    },
    FAILURE: {
      EMAIL_EXISTS: "Email is already registered.",
      INVALID_CREDENTIALS: "Invalid credentials.",
      PASSWORD_RESET_FAILURE: "Passowrd reset failure.",
    },
  },
  GOOGLE: {
    SUCCESS: {
      CAPTCHA_VERIFY_SUCCESS: "You have been verified! You may proceed.",
    },
    FAILURE: {
      CAPTCHA_VERIFY_FAILURE: "malicious activity detected.",
      GOOGLE_CAPTCHA_INTERNAL_ERROR: "error on google captcha service.",
    },
  },
  CRUD: {
    SUCCESS: {
      GET_USER_SUCCESS: "Get user success.",
      UPDATE_USER_SUCCESS: "Update user success.",
      DELETE_USER_SUCCESS: "Delete user success.",
      GET_USERS_SUCCESS: "Get users success.",
    },
  },
};

module.exports = Object.freeze({
  ROLE,
  USER_NOTIFICATIONS,
});
