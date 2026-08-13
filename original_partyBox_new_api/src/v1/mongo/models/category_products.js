const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const category_productsSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    product_id: { type: Number, required: true },
    category_id: { type: String, required: true },
  },
  {
    collection: "category_products",
    timestamps: false,
  }
);

category_productsSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("category_products");
  }
  next();
});

module.exports = mongoose.models.category_products || mongoose.model("category_products", category_productsSchema);
