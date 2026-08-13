const multer = require("multer");

const storage = multer.memoryStorage();

const imageFilter = (_req, file, cb) => {
  const ok = /^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.mimetype);
  if (!ok) {
    return cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"));
  }
  return cb(null, true);
};

const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB
  },
});

module.exports = {
  uploadImage,
};
