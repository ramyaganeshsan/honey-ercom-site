const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const image_resizeSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    list_width: { type: Number, required: true },
    list_height: { type: Number, required: true },
    detail_width: { type: Number, required: true },
    detail_height: { type: Number, required: true },
    thumb_width: { type: Number, required: true },
    thumb_height: { type: Number, required: true },
    type: { type: Number, required: true },
  },
  {
    collection: "image_resize",
    timestamps: false,
  }
);

image_resizeSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("image_resize");
  }
  next();
});

module.exports = mongoose.models.image_resize || mongoose.model("image_resize", image_resizeSchema);
