const path = require("path");

exports.fileExtLimiter = (allowedExtArray, expressHttpParameters) => {
  const { req } = expressHttpParameters;
  const fileExtensions = _getFileExtensions(req);
  const allowed = fileExtensions.every((ext) => allowedExtArray.includes(ext));
  if (!allowed) {
    const message = `Upload failed. Only ${allowedExtArray.toString()} files allowed.`;
    return { isSuccess: false, statusCode: 422, message };
  }
};

function _getFileExtensions(req) {
  const fileExtensions = [];
  const isSingleFileUpload = !!req.file;
  if (isSingleFileUpload) {
    const fileExtension = _getFileExtensionFromFileName(req.file.originalname);
    fileExtensions.push(fileExtension);
  } else {
    const files = req.files;
    Object.keys(files).forEach((key) => {
      fileExtensions.push(
        _getFileExtensionFromFileName(files[key].originalname)
      );
    });
  }
  return fileExtensions;
}

function _getFileExtensionFromFileName(fileName) {
  return path.extname(fileName);
}
