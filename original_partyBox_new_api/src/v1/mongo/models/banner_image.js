const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");
const { optionalString } = require("../schemaHelpers");

const banner_imageSchema = new mongoose.Schema(
  {
    banner_id: { type: Number, required: false },
    image_title: { type: String, required: true },
    image_title_french: optionalString,
    image_info_french: optionalString,
    image_info: optionalString,
    redirect_url: { type: String, default: "/products" },
    position: { type: Number, required: true, default: 0 },
    product: { type: Number, required: true, default: 0 },
    home: { type: Number, required: true, default: 1 },
    status: { type: Number, required: true, default: 1 },
  },
  {
    collection: "banner_image",
    timestamps: false,
  }
);

banner_imageSchema.pre("validate", function (next) {
  if (!this.image_title_french) {
    this.image_title_french = this.image_title || "";
  }
  next();
});

banner_imageSchema.pre("save", async function (next) {
  if (this.banner_id == null) {
    this.banner_id = await getNextSequence("banner_image");
  }
  next();
});

module.exports =
  mongoose.models.banner_image || mongoose.model("banner_image", banner_imageSchema);
