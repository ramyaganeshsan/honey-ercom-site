const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const sub_productsSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    product_id: { type: Number, required: true },
    size_id: { type: Number, default: 0 },
    color_id: { type: Number, default: 0 },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, required: true },
    product_key: { type: String, required: true },
    product_image: { type: String, required: true },
    sku: { type: String, required: true },
    created_date: { type: Number, required: true },
    updated_date: { type: Number },
    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    plength: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
  },
  {
    collection: "sub_products",
    timestamps: false,
    strict: false,
  }
);

sub_productsSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("sub_products");
  }
  next();
});

module.exports = mongoose.models.sub_products || mongoose.model("sub_products", sub_productsSchema);
