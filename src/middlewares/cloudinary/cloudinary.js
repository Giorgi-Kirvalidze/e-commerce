const cloudinary = require("cloudinary").v2;
const fs = require("fs");

exports.uploadToCloudinary = async (
  locaFilePath,
  cloudinaryImagePath,
  removeLocalFolderPath
) => {
  return cloudinary.uploader
    .upload(locaFilePath, { public_id: cloudinaryImagePath })
    .then((result) => {
      fs.rmSync(removeLocalFolderPath, { recursive: true, force: true });
      return {
        isSuccess: true,
        url: result.url,
      };
    })
    .catch((e) => {
      fs.rmSync(removeLocalFolderPath, { recursive: true, force: true });
      return { isSuccess: false, message: e.message };
    });
};
