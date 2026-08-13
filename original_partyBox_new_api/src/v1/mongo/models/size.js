const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const sizeSchema = new mongoose.Schema(
  {
    size_id: { type: Number, required: false },
    category_attribute_id: { type: Number, required: true },
    category_attribute_group_id: { type: Number, required: true },
    size_name: { type: String, required: true },
    size_name_french: { type: String, required: true },
    main_category_id: { type: Number, required: true },
  },
  {
    collection: "size",
    timestamps: false,
  }
);

sizeSchema.pre("save", async function (next) {
  if (this.size_id == null) {
    this.size_id = await getNextSequence("size");
  }
  next();
});

module.exports = mongoose.models.size || mongoose.model("size", sizeSchema);
