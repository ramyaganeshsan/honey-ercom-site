const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const product_attributeSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    product_id: { type: Number, required: true },
    attribute_id: { type: Number, required: true },
    text: { type: String, required: true },
  },
  {
    collection: "product_attribute",
    timestamps: false,
  }
);

product_attributeSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("product_attribute");
  }
  next();
});

module.exports = mongoose.models.product_attribute || mongoose.model("product_attribute", product_attributeSchema);
