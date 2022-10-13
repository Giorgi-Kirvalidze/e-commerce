const COMMON_NOTIFICATIONS = {
  SUCCESS: {},
  FAILURE: {
    RESOURCE_NOT_FOUND: "Resource not fould",
    ADMIN_ACESS_DENIED: "Admin access denied",
    EROR_WHILE_RENDERING_EMAIL_TEMPLATE: "Error while rendering email template",
  },
};

module.exports = Object.freeze({
  COMMON_NOTIFICATIONS,
});
