const Product = require("../models/schemas/Product");
const slugify = require("slugify");
const { COMMON_NOTIFICATIONS } = require("../constants/commonConstants");
const { uploadToCloudinary } = require("../middlewares/cloudinary/cloudinary");
const fs = require("fs");

exports.addProduct = async (req, res) => {
  const productObj = {
    ...req.body,
    slug: slugify(req.body.name),
    sku: req.body.size
      ? slugify(req.body.name) + "-" + req.body.size
      : slugify(req.body.name),
    createdBy: req.user._id,
  };

  const productImageurls = [];
  const productImages = req.files;

  if (productImages) {
    for (const file of productImages) {
      const { path } = file;
      const result = await uploadToCloudinary(path, path);

      /* TODO if one upload fails remove other uploads too */
      if (!result.isSuccess) {
        return res
          .status(500)
          .send({ isSuccess: false, message: "product upload failed." });
      }
      productImageurls.push({ imgUrl: result.url, cloudinaryImagePath: path });
    }
    fs.rmSync("uploads/productImages", { recursive: true, force: true });
    productObj.productImages = productImageurls;
  }

  const product = new Product(productObj);
  try {
    const newProduct = await product.save();
    return res.status(201).json({
      isSuccess: true,
      message: "Product add success",
      payload: { newProduct },
    });
  } catch (e) {
    return res.status(400).json({ isSuccess: false, message: e.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(400)
        .json({ message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND });
    return res.send(product);
  } catch (e) {
    return res.status(400).json(e);
  }
};

exports.listProducts = async (req, res) => {
  let limit =
    req.query.limit & (req.query.limit <= 100) ? parseInt(req.query.limit) : 10;
  let page = 0;
  if (req.query) {
    if (req.query.page) {
      req.query.page = parseInt(req.query.page);
      page = Number.isInteger(req.query.page) ? req.query.page : 0;
    }
  }
  try {
    const products = await Product.find()
      .limit(limit)
      .skip(page * limit);
    if (!products) {
      return res
        .status(400)
        .json({ message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND });
    }
    res.status(200).send({
      isSuccess: true,
      message: "Products get success",
      payload: { products },
    });
  } catch (e) {
    return res.status(500).send({ isSuccess: false, message: e.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({});
    }
    updates.forEach((update) => (product[update] = req.body[update]));
    const updatedProduct = await product.save();
    return res.send(updatedProduct);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) {
      return res
        .status(404)
        .send({ message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND });
    }
    return res
      .status(200)
      .json({ isSuccess: true, message: "Product delete success." });
  } catch (e) {
    return res.status(500).json({ isSuccess: false, message: e.message });
  }
};
