const MB = 5; // 5 MB
const FILE_SIZE_LIMIT = MB * 1024 * 1024;

const fileSizeLimiter = (req, res, next) => {
  const filesOverLimit = _getFilesOverLimit(req);

  if (filesOverLimit.length > 0) {
    const properVerb = filesOverLimit.length > 1 ? "are" : "is";

    const sentence = `Upload failed. ${filesOverLimit.toString()} ${properVerb} over the file size limit of ${MB} MB.`;

    const message =
      filesOverLimit.length < 3
        ? sentence.replace(",", " and")
        : sentence.replace(/,(?=[^,]*$)/, " and");
    console.log("over limit");
    return { isSuccess: false, message, statusCode: 413 };
  }
};

function _getFilesOverLimit(req) {
  const filesOverLimit = [];
  const isSingleFileUpload = !!req.file;
  if (isSingleFileUpload) {
    // Is file over the limit?
    if (req.file.size > FILE_SIZE_LIMIT) {
      filesOverLimit.push(req.file.originalname);
    }
  } else {
    // Which files are over the limit?
    Object.keys(req.files).forEach((key) => {
      if (req.files[key].size > FILE_SIZE_LIMIT) {
        filesOverLimit.push(req.files[key].originalname);
      }
    });
  }
  return filesOverLimit;
}

module.exports = fileSizeLimiter;
