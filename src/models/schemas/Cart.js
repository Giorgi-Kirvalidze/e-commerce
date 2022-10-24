const mongoose = require("mongoose");
const { DecimalField } = require("../helpers");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true,
    },
    quantity: { type: Number, default: 1 },
    price: DecimalField,
  },
  { toJSON: { getters: true }, _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
