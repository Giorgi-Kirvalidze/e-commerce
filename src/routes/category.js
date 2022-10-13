const express = require("express");
const router = express.Router();
const { requireSignin, adminMiddleware } = require("../middlewares/auth");
const {
  addCategory,
  updateCategory,
  deleteCategory,
  listCategories,
} = require("../contollers/categoryController");
const {
  CategoryAddSchema,
  CategoryUpdateSchema,
} = require("../middlewares/joi/cateorgy-schema");
const { fileValidators } = require("../middlewares/file-uploader");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

/* Multer setup */
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const path = `./uploads/categoryImages`;
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
  const removeFolderPath = "uploads/categoryImages";
  fs.rmSync(removeFolderPath, { recursive: true, force: true });
  return res.status(errorResponse.statusCode).json({
    message: errorResponse.message,
    isSuccess: errorResponse.isSuccess,
  });
}

router.get("/", requireSignin, listCategories);
router.post(
  "/",
  requireSignin,
  adminMiddleware,
  fileUpload.single("categoryImage"),
  CategoryAddSchema,
  fileValidators(_handleInvalidFileUpload),
  addCategory
);
router.patch(
  "/:id",
  requireSignin,
  adminMiddleware,
  fileUpload.single("categoryImage"),
  CategoryUpdateSchema,
  fileValidators(_handleInvalidFileUpload),
  updateCategory
);
router.delete("/:id", requireSignin, adminMiddleware, deleteCategory);

module.exports = router;
