const Joi = require("joi");
const { validateRequest } = require("./joi-helpers");

exports.CategoryAddSchema = (req, _, next) => {
  const schema = Joi.object({
    parentId: Joi.string(),
    name: Joi.string().required(),
    categoryImage: Joi.string(),
  });
  validateRequest(req, next, schema);
};

exports.CategoryUpdateSchema = (req, _, next) => {
  const schema = Joi.object({
    parentId: Joi.string(),
    name: Joi.string().required(),
    categoryImage: Joi.string(),
  });
  validateRequest(req, next, schema);
};
