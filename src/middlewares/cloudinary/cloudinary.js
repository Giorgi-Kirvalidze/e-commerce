const cloudinary = require("cloudinary").v2;
const fs = require("fs");

function _uploadToCloudinary(file, cloudinaryImagePath) {
  return new Promise(async (resolve, reject) => {
    return await cloudinary.uploader.upload(
      file.path,
      { public_id: cloudinaryImagePath },
      function (error, result) {
        if (error) {
          reject(error);
        } else {
          resolve({
            imgUrl: result.url,
            cloudinaryImagePath: result.public_id,
          });
        }
      }
    );
  });
}

/* handling single File uploads */
exports.uploadSingleFile = async (
  file,
  clearLocalFolderPath,
  cloudinaryImagePath = null
) => {
  /* checking if it is an update mode then replacing existing file on cloudinary*/
  const isUpdate = !!cloudinaryImagePath;
  const filePath = isUpdate ? cloudinaryImagePath : file.path;
  return await _uploadToCloudinary(file, filePath)
    .then((result) => ({
      result,
      isSuccess: true,
    }))
    .catch((error) => {
      return res.status(500).json({
        isSuccess: false,
        message: "Error while uploading images",
      });
    })
    .finally(() => {
      fs.rmSync(clearLocalFolderPath, { recursive: true, force: true });
    });
};

/* TODO update has a bug, cause we are adding req,file.paths.
 so it is a new files,  document is correctly updated,
  but we need to use existing cloudImagePath, to replace files in cloudinary */
exports.uploadMultipleFile = async (
  files,
  clearLocalFolderPath,
  cloudinaryImagePath,
  res
) => {
  let res_promises = files.map((file) => _uploadToCloudinary(file));

  return await Promise.all(res_promises)
    .then((result) => ({
      result,
      isSuccess: true,
    }))
    .catch((error) => {
      return res.status(500).json({
        isSuccess: false,
        message: "Error while uploading images",
      });
    })
    .finally(() => {
      fs.rmSync(clearLocalFolderPath, { recursive: true, force: true });
    });
};
