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

/** Excel (.xlsx/.xls) + optional ZIP of gallery images for bulk product import */
const bulkUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file
  },
  fileFilter: (_req, file, cb) => {
    const name = String(file.originalname || "").toLowerCase();
    const field = String(file.fieldname || "");
    if (field === "excel") {
      const okExt = /\.(xlsx|xls|csv)$/i.test(name);
      const okMime =
        /spreadsheet|excel|csv|octet-stream|zip/i.test(file.mimetype || "") ||
        okExt;
      if (!okExt && !okMime) {
        return cb(new Error("Excel file must be .xlsx, .xls, or .csv"));
      }
      return cb(null, true);
    }
    if (field === "images_zip") {
      const okExt = /\.zip$/i.test(name);
      const okMime = /zip|octet-stream/i.test(file.mimetype || "") || okExt;
      if (!okExt && !okMime) {
        return cb(new Error("Images archive must be a .zip file"));
      }
      return cb(null, true);
    }
    return cb(new Error(`Unexpected upload field: ${field}`));
  },
});

module.exports = {
  uploadImage,
  bulkUpload,
};
