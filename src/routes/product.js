const {
  addProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  listProducts,
} = require("../contollers/productController");
const express = require("express");
const { requireSignin, adminMiddleware } = require("../middlewares/auth");
const router = express.Router();
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

/* Multer setup */
const multer = require("multer");
const { ProductAddSchema } = require("../middlewares/joi/product-schema");
const { fileValidators } = require("../middlewares/file-uploader");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = `./uploads/productImages`;
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    return cb(null, path);
  },
  filename: function (req, file, cb) {
    return cb(null, uuidv4());
  },
});
const fileUpload = multer({ storage });

function _handleInvalidFileUpload(res, errorResponse) {
  const removeFolderPath = "uploads/productImages";
  fs.rmSync(removeFolderPath, { recursive: true, force: true });
  return res.status(errorResponse.statusCode).json({
    message: errorResponse.message,
    isSuccess: errorResponse.isSuccess,
  });
}

router.post(
  "/",
  requireSignin,
  adminMiddleware,
  fileUpload.array("productImages"),
  ProductAddSchema,
  fileValidators(_handleInvalidFileUpload),
  addProduct
);
router.get("/", requireSignin, listProducts);
router.get("/:id", requireSignin, getProduct);
router.patch("/:id", requireSignin, adminMiddleware, updateProduct);
router.delete("/:id", requireSignin, adminMiddleware, deleteProduct);

module.exports = router;
