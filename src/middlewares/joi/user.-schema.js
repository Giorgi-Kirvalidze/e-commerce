const Joi = require("joi");
const { ROLE } = require("../../constants/userConstants");
const { validateRequest } = require("./joi-helpers");

exports.signupUserSchema = (req, _, next) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    phone: Joi.string().required(),
  });
  validateRequest(req, next, schema);
};

exports.signinUserSchema = (req, _, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
};

exports.updateUserSchema = (req, _, next) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    phone: Joi.string().required(),
    role: Joi.string().valid(ROLE.ADMIN, ROLE.USER),
  });
  validateRequest(req, next, schema);
};

exports.passwordResetSchema = (req, _, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  validateRequest(req, next, schema);
};

exports.newPasswordSchema = (req, _, next) => {
  const schema = Joi.object({
    password: Joi.string().email().required(),
  });
  validateRequest(req, next, schema);
};

exports.googleCaptchaVerifySchema = (req, _, next) => {
  const schema = Joi.object({
    captchaToken: Joi.string().email().required(),
  });
  validateRequest(req, next, schema);
};
