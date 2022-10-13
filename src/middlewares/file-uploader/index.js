const { fileExtLimiter } = require("./fileExtLimiter");
const fileSizeLimiter = require("./fileSizeLimiter");

/* Validating files if is uploaded */
exports.fileValidators = (
  callback,
  allowedExtensionsArray = [".png", ".jpg", ".jpeg"]
) => {
  return (req, res, next) => {
    const isFileUploading = req.files?.length > 0 || req.file;
    if (isFileUploading) {
      const fileExtLimiterErrorRes = fileExtLimiter(allowedExtensionsArray, {
        req,
        res,
        next,
      });
      const fileSizeLimiterErrorRes = fileSizeLimiter(req, res, next);

      if (fileExtLimiterErrorRes) {
        return callback(res, fileExtLimiterErrorRes);
      } else if (fileSizeLimiterErrorRes) {
        return callback(res, fileSizeLimiterErrorRes);
      } else {
        console.log("files validated successfuly");
      }
    }
    next();
  };
};
