const express = require("express");
const { addItemToCart, getUserCart } = require("../contollers/cartController");
const { requireSignin } = require("../middlewares/auth");
const router = express.Router();

router.get("/", requireSignin, getUserCart);
router.post("/", requireSignin, addItemToCart);

module.exports = router;
