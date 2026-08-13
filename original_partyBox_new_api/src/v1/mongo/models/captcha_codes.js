const mongoose = require("mongoose");

const captcha_codesSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    namespace: { type: String, required: true },
    code: { type: String, required: true },
    code_display: { type: String, required: true },
    created: { type: Number, required: true },
    audio_data: { type: Buffer },
  },
  {
    collection: "captcha_codes",
    timestamps: false,
  }
);

module.exports = mongoose.models.captcha_codes || mongoose.model("captcha_codes", captcha_codesSchema);
