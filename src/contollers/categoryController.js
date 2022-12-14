const Category = require("../models/schemas/Category");
const Product = require("../models/schemas/Product");
const slugify = require("slugify");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { CAREGORY_NOTIFICATIONS } = require("../constants/categoryConstants");
const { COMMON_NOTIFICATIONS } = require("../constants/commonConstants");
const { uploadSingleFile } = require("../middlewares/cloudinary/cloudinary");

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
    const response = await uploadSingleFile(
      req.file,
      CAREGORY_NOTIFICATIONS.FILE_UPLOADS.CATEGORY_IMAGE_LOCAL_FOLDER_PATH
    );
    if (!response.isSuccess) {
      return res
        .status(500)
        .send({ isSuccess: false, message: "category image upload failed." });
    }
    categoryObj.cloudinaryImagePath = response.result.cloudinaryImagePath;
    categoryObj.categoryImage = response.result.imgUrl;
  }
  try {
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
  const updates = Object.keys(req.body);

  const categoryToBeUpdated = await Category.findById(req.params.id);
  if (!categoryToBeUpdated) {
    return res.status(404).json({
      isSuccess: false,
      message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND,
    });
  }
  const findCategoryByName = await Category.findOne({ name: req.body.name });

  if (findCategoryByName) {
    if (categoryToBeUpdated._id !== findCategoryByName._id) {
      return res.status(400).json({
        isSuccess: false,
        message: CAREGORY_NOTIFICATIONS.CRUD.FAILURE.CATEGORY_ALREADY_EXISTS,
      });
    }
  }

  updates.forEach((update) => {
    if (
      categoryToBeUpdated[update] !==
      CAREGORY_NOTIFICATIONS.FILE_UPLOADS.CATEGORY_IMAGE_FORMCONTROL_NAME
    ) {
      return (categoryToBeUpdated[update] = req.body[update]);
    }
  });

  if (req.file) {
    const response = await uploadSingleFile(
      req.file,
      CAREGORY_NOTIFICATIONS.FILE_UPLOADS.CATEGORY_IMAGE_LOCAL_FOLDER_PATH,
      categoryToBeUpdated.cloudinaryImagePath
    );
    if (!response.isSuccess) {
      return res
        .status(500)
        .send({ isSuccess: false, message: "category image upload failed." });
    }
    categoryToBeUpdated.categoryImage = response.result.imgUrl;
  }
  try {
    const updatedCategory = await categoryToBeUpdated.save();

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
  const category = await Category.findByIdAndRemove(req.params.id);
  if (!category) {
    return res.status(400).json({
      isSuccess: false,
      message: COMMON_NOTIFICATIONS.FAILURE.RESOURCE_NOT_FOUND,
    });
  }
  try {
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
