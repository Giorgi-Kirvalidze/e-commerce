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
    .catch(() => ({
      isSuccess: false,
      message: "Error while uploading file",
    }))
    .finally(() => {
      fs.rmSync(clearLocalFolderPath, { recursive: true, force: true });
    });
};

exports.uploadMultipleFile = async (
  newfiles,
  toFolderPath,
  isUpdate = false
) => {
  let res_promises = null;
  if (!isUpdate) {
    res_promises = newfiles.map((file) =>
      _uploadToCloudinary(file, toFolderPath + "/" + file.filename)
    );
  } else {
    await cloudinary.api.delete_resources_by_prefix(toFolderPath).then(() => {
      res_promises = newfiles.map((file) =>
        _uploadToCloudinary(file, toFolderPath + "/" + file.filename)
      );
    });
  }

  return await Promise.all(res_promises)
    .then((result) => ({
      result,
      isSuccess: true,
    }))
    .catch(() => {
      return {
        isSuccess: false,
        message: "Error while uploading file",
      };
    })
    .finally(() => {
      fs.rmSync(newfiles[0].destination, { recursive: true, force: true });
    });
};
