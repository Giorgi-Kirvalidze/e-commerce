const cloudinary = require("cloudinary").v2;

exports.uploadToCloudinary = async (locaFilePath, cloudinaryImagePath) => {
  return cloudinary.uploader
    .upload(locaFilePath, { public_id: cloudinaryImagePath })
    .then((result) => {
      return {
        isSuccess: true,
        url: result.url,
      };
    })
    .catch((e) => {
      return { isSuccess: false, message: e };
    });
};
