const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const banner_imageSchema = new mongoose.Schema(
  {
    banner_id: { type: Number, required: false },
    image_title: { type: String, required: true },
    image_title_french: { type: String, required: true },
    image_info_french: { type: String, required: true },
    image_info: { type: String, required: true },
    redirect_url: { type: String, required: true },
    position: { type: Number, required: true },
    product: { type: Number, required: true },
    home: { type: Number, required: true },
    status: { type: Number, required: true, default: 1 },
  },
  {
    collection: "banner_image",
    timestamps: false,
  }
);

banner_imageSchema.pre("save", async function (next) {
  if (this.banner_id == null) {
    this.banner_id = await getNextSequence("banner_image");
  }
  next();
});

module.exports = mongoose.models.banner_image || mongoose.model("banner_image", banner_imageSchema);
