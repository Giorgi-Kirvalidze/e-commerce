const cloudinary = require("cloudinary").v2;
const fs = require("fs");

function _uploadToCloudinary(file) {
  return new Promise(async (resolve, reject) => {
    return await cloudinary.uploader.upload(
      file.path,
      { public_id: file.path },
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

exports.uploadToCloudinary = async (req, res, clearLocalFolderPath) => {
  let res_promises = req.file
    ? [_uploadToCloudinary(req.file)]
    : req.files.map((file) => _uploadToCloudinary(file));

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
