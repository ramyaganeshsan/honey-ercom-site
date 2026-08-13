/**
 * Mongoose treats empty string "" as failing `required: true` on String paths.
 * Use optionalString for fields that may be blank in admin forms.
 */
exports.optionalString = { type: String, default: "" };

exports.requiredString = { type: String, required: true, trim: true };

/** Extract a readable message from Mongoose / Mongo errors */
exports.errorMessage = (err, fallback = "Request failed") => {
  if (!err) return fallback;
  if (err.name === "ValidationError" && err.errors) {
    const parts = Object.values(err.errors).map((e) => e.message);
    return parts.filter(Boolean).join("; ") || fallback;
  }
  if (err.code === 11000) {
    const keys = Object.keys(err.keyPattern || err.keyValue || {});
    return keys.length
      ? `Duplicate value for: ${keys.join(", ")}`
      : "Duplicate record already exists";
  }
  return err.message || fallback;
};
