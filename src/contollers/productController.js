const Product = require("../models/Product");
const slugify = require("slugify");

exports.createProduct = async (req, res) => {
  let productPictures = [];
  if (req.files.length > 0) {
    productPictures = req.files.map((file) => {
      return { img: file.filename };
    });
  }

  const product = new Product({
    ...req.body,
    slug: slugify(req.body.name),
    createdBy: req.user._id,
    productPictures,
  });
  try {
    const newProduct = await product.save();
    return res.status(201).json(newProduct);
  } catch (e) {
    return res.status(400).json(e);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(400)
        .json({ message: "No products associated with that id" });
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
    let products = await Product.find()
      .limit(limit)
      .skip(page * limit);
    if (!products) {
      return res.status(400).json({ message: "No products in the database" });
    }
    res.status(200).send(products);
  } catch (e) {
    return res.status(500).send(e);
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
    await Product.findByIdAndRemove(req.params.id);
    return res.status(204).json({ message: "Product deleted successfully." });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "No product associated with that id." });
  }
};
