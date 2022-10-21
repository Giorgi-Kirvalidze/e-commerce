const Joi = require("joi");
const { validateRequest } = require("./joi-helpers");

exports.ProductAddSchema = (req, _, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    size: Joi.string(),
    quantity: Joi.number().required(),
    category: Joi.string().required(),
    description: Joi.string().required(),
    reviews: Joi.array().items(
      Joi.object().keys({
        review: Joi.string().required(),
      })
    ),
    slug: Joi.string(),
    sku: Joi.string(),
    createdBy: Joi.string(),
    productPictures: Joi.array().items(Joi.string()),
  });
  validateRequest(req, next, schema);
};

exports.ProductUpdateSchema = (req, _, next) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required(),
    size: Joi.string(),
    quantity: Joi.number().required(),
    category: Joi.string().required(),
    description: Joi.string().required(),
    reviews: Joi.array().items(
      Joi.object().keys({
        review: Joi.string().required(),
      })
    ),
    slug: Joi.string(),
    sku: Joi.string(),
    createdBy: Joi.string(),
    productPictures: Joi.array().items(Joi.string()),
  });
  validateRequest(req, next, schema);
};
