const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const category_attribute_valuesSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    name: { type: String, required: true },
    name_french: { type: String, required: true },
    status: { type: Number, required: true },
  },
  {
    collection: "category_attribute_values",
    timestamps: false,
  }
);

category_attribute_valuesSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("category_attribute_values");
  }
  next();
});

module.exports = mongoose.models.category_attribute_values || mongoose.model("category_attribute_values", category_attribute_valuesSchema);
