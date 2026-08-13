const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const attributeSchema = new mongoose.Schema(
  {
    attribute_id: { type: Number, required: false },
    name: { type: String, required: true },
    name_french: { type: String, required: true },
    attribute_group: { type: Number, required: true },
    sort_order: { type: Number, required: true },
  },
  {
    collection: "attribute",
    timestamps: false,
  }
);

attributeSchema.pre("save", async function (next) {
  if (this.attribute_id == null) {
    this.attribute_id = await getNextSequence("attribute");
  }
  next();
});

module.exports = mongoose.models.attribute || mongoose.model("attribute", attributeSchema);
