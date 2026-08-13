const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const productSchema = new mongoose.Schema(
  {
    deal_id: { type: Number, required: false },
    deal_title: { type: String, required: true },
    deal_title_french: { type: String, required: true },
    url_title: { type: String, required: true },
    deal_key: { type: String, required: true },
    deal_description: { type: String, required: true },
    deal_description_french: { type: String, required: true },
    brand_id: { type: Number, required: true },
    terms_conditions: { type: String, required: true },
    meta_description: { type: String, required: true },
    meta_keywords: { type: String, required: true },
    meta_description_french: { type: String, required: true },
    meta_keywords_french: { type: String, required: true },
    category_ids: { type: String, required: true },
    category_id: { type: Number, required: true },
    sub_category_id: { type: Number, required: true },
    sec_category_id: { type: Number, required: true },
    third_category_id: { type: Number, required: true },
    deal_type: { type: Number, required: true },
    deal_value: { type: Number, required: true },
    deal_price: { type: Number, required: true },
    deal_savings: { type: Number, required: true },
    shop_id: { type: Number, required: true, default: 1 },
    deal_percentage: { type: Number, required: true },
    purchase_count: { type: Number, required: true },
    user_limit_quantity: { type: Number, required: true },
    created_date: { type: Number, required: true },
    created_by: { type: Number, required: true },
    deal_status: { type: Number, required: true, default: 1 },
    delivery_period: { type: String, required: true },
    view_count: { type: Number, required: true },
    attribute: { type: Number, required: true },
    deal_feature: { type: Number, required: true },
    combo_products: { type: String, required: true },
    combo_price: { type: String, required: true },
    event_id: { type: Number },
    tags: { type: String, required: true },
    cat_tags: { type: String, required: true },
    related_products: { type: String, required: true },
    is_customized: { type: Number, required: true },
    having_size_color: { type: Number, required: true },
    merchant_id: { type: Number, required: true, default: 1 },
    shipping: { type: Number, required: true, default: 0 },
    brand_names: { type: String, required: true, default: "" },
    supplier_names: { type: String, required: true },
    supplier_id: { type: Number, required: true },
    ballon_filling_option: { type: String, required: true },
  },
  {
    collection: "product",
    timestamps: false,
  }
);

productSchema.pre("save", async function (next) {
  if (this.deal_id == null) {
    this.deal_id = await getNextSequence("product");
  }
  next();
});

module.exports = mongoose.models.product || mongoose.model("product", productSchema);
