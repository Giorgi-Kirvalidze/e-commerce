const CAREGORY_NOTIFICATIONS = {
  CRUD: {
    SUCCESS: {
      CAREGORY_ADD_SUCCESS: "Category add success.",
      CAREGORY_UPDATE_SUCCESS: "Category update success.",
      CAREGORY_DELETE_SUCCESS: "Category delete success.",
    },
    FAILURE: {
      CATEGORY_ALREADY_EXISTS: "Category already exists",
    },
  },
  FILE_UPLOADS: {
    CATEGORY_IMAGE_LOCAL_FOLDER_PATH: "uploads/categoryImages",
    CATEGORY_IMAGE_FORMCONTROL_NAME: "categoryImage",
  },
};

module.exports = Object.freeze({
  CAREGORY_NOTIFICATIONS,
});
