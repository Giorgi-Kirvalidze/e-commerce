const Cart = require("../models/schemas/Cart");

exports.addItemToCart = async (req, res) => {
  const oldCart = await Cart.findOne({ user: req.user._id });
  if (!oldCart) {
    const cart = new Cart({
      user: req.user._id,
      cartItems: req.body.cartItems,
    });
    const newCart = await cart.save();
    return res.status(201).json({
      isSuccess: true,
      message: "Cart item add success",
      payload: {
        newCart,
      },
    });
  } else {
    for (let item of req.body.cartItems) {
      const existingItemIndex = oldCart.cartItems.findIndex(
        (c) => c.product == item.product
      );
      if (existingItemIndex > -1) {
        oldCart.cartItems[existingItemIndex].quantity =
          +oldCart.cartItems[existingItemIndex].quantity + +item.quantity;
        await oldCart.save();
      } else {
        await Cart.findOneAndUpdate(
          { user: req.user._id },
          {
            $push: {
              cartItems: req.body.cartItems,
            },
          }
        );
        await oldCart.save();
      }
    }
    return res.status(201).json({
      isSuccess: true,
      message: "Cart item add success",
    });
  }
};

exports.getUserCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    return res.status(200).json({
      isSuccess: true,
      message: "Cart get success",
      payload: {
        cart,
      },
    });
  }
};
