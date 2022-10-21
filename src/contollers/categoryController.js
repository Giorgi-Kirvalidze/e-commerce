const Category = require("../models/schemas/Category");
const Product = require("../models/schemas/Product");
const slugify = require("slugify");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { CAREGORY_NOTIFICATIONS } = require("../constants/categoryConstants");
const { COMMON_NOTIFICATIONS } = require("../constants/commonConstants");
const { uploadToCloudinary } = require("../middlewares/cloudinary/cloudinary");

function createCategories(categories, parentId = null) {
  const categoryList = [];
  let category;
  if (parentId === null) {
    category = categories.filter((category) => category.parentId === undefined);
  } else {
    category = categories.filter((category) => category.parentId === parentId);
  }
  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      parentId: cate.parentId,
      slug: cate.slug,
      image: cate.categoryImage || null,
      cloudinaryImagePath: cate.cloudinaryImagePath || null,
      children: createCategories(categories, cate._id),
    });
  }
  return categoryList;
}

exports.addCategory = async (req, res) => {
  const categoryObj = {
    name: req.body.name,
    slug: slugify(req.body.name),
    createdBy: req.user._id,
  };
  if (req.body.parentId) {
    categoryObj.parentId = req.body.parentId;
  }
  try {
    const categoryExists = await Category.findOne({ name: req.body.name });
    if (categoryExists) {
      fs.rmSync(
        CAREGORY_NOTIFICATIONS.FILE_UPLOADS.CATEGORY_IMAGE_LOCAL_FOLDER_PATH,
        { recursive: true, force: true }
      );
      return res.status(400).json({
        isSuccess: false,
        message: CAREGORY_NOTIFICATIONS.CRUD.FAILURE.CATEGORY_ALREADY_EXISTS,
      });
    }
    if (req.file) {
      const localFilePath = req.file.path;
      const cloudinaryImagePath = localFilePath;
      const result = await uploadToCloudinary(
        localFilePath,
        cloudinaryImagePath
      );
      if (!result.isSuccess) {
        return res
          .status(500)
          .send({ isSuccess: false, message: "category image upload failed." });
      }
      categoryObj.cloudinaryImagePath = locaFilePath;
      categoryObj.categoryImage = result.url;
      fs.rmSync(
        CAREGORY_NOTIFICATIONS.FILE_UPLOADS.CATEGORY_IMAGE_LOCAL_FOLDER_PATH,
        { recursive: true, force: true }
      );
    }
    const category = new Category(categoryObj);
    const newCategory = await category.save();
    res.status(201).json({
      isSuccess: true,
      message: CAREGORY_NOTIFICATIONS.CRUD.SUCCESS.CAREGORY_ADD_SUCCESS,
      payload: {
        category: newCategory,
      },
    });
  } catch (e) {
    return res.status(500).json({ isSuccess: false, message: e.message });
  }
};

exports.listCategories = async (req, res) => {
  const categories = await Category.find();
  if (categories) {
    const categoryList = createCategories(categories);
    return res.status(200).json({ categoryList });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        isSuccess: false,
        message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND,
      });
    }
    updates.forEach((update) => {
      if (
        category[update] !==
        CAREGORY_NOTIFICATIONS.FILE_UPLOADS.CATEGORY_IMAGE_FORMCONTROL_NAME
      ) {
        return (category[update] = req.body[update]);
      }
    });

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.path,
        category.cloudinaryImagePath
      );
      if (!result.isSuccess) {
        return res
          .status(500)
          .send({ isSuccess: false, message: "category image upload failed." });
      }
      fs.rmSync(
        CAREGORY_NOTIFICATIONS.FILE_UPLOADS.CATEGORY_IMAGE_LOCAL_FOLDER_PATH,
        { recursive: true, force: true }
      );
      category.categoryImage = result.url;
    }

    const updatedCategory = await category.save();

    return res.status(200).json({
      isSuccess: true,
      message: CAREGORY_NOTIFICATIONS.CRUD.SUCCESS.CAREGORY_UPDATE_SUCCESS,
      payload: { updatedCategory },
    });
  } catch (e) {
    return res.status(400).send({ isSuccess: false, message: e.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndRemove(req.params.id);
    if (!category) {
      return res.status(400).json({
        isSuccess: false,
        message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND,
      });
    }
    await cloudinary.uploader.destroy(category.cloudinaryImagePath);
    await Category.deleteMany({ parentId: req.params.id });
    await Product.deleteMany({ category: req.params.id });
    return res.status(200).json({
      isSuccess: true,
      message: CAREGORY_NOTIFICATIONS.CRUD.SUCCESS.CAREGORY_DELETE_SUCCESS,
    });
  } catch (e) {
    return res.status(400).json({ isSuccess: false, message: e.message });
  }
};
