const mongoose = require("mongoose");
const slugify = require("slugify");
const { DecimalField } = require("../helpers");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: DecimalField,
    size: {
      type: String,
    },
    quantity: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        review: String,
      },
    ],
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    productImages: [
      {
        imgUrl: String,
        cloudinaryImagePath: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { getters: true } }
);

productSchema.pre("save", async function (next) {
  const product = this;
  if (product.isModified("name")) {
    product.slug = slugify(product.name);
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
