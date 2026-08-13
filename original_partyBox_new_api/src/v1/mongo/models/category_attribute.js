const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const category_attributeSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    name: { type: String, required: true },
    name_french: { type: String, required: true },
    status: { type: Number, required: true },
  },
  {
    collection: "category_attribute",
    timestamps: false,
  }
);

category_attributeSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("category_attribute");
  }
  next();
});

module.exports = mongoose.models.category_attribute || mongoose.model("category_attribute", category_attributeSchema);
