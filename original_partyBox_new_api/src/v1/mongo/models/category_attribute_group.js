const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const category_attribute_groupSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    name: { type: String, required: true },
    name_french: { type: String, required: true },
    status: { type: Number, required: true },
  },
  {
    collection: "category_attribute_group",
    timestamps: false,
  }
);

category_attribute_groupSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("category_attribute_group");
  }
  next();
});

module.exports = mongoose.models.category_attribute_group || mongoose.model("category_attribute_group", category_attribute_groupSchema);
