const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

/** Allow empty strings — mongoose `required: true` rejects "". */
const optionalString = { type: String, default: "" };

const productSchema = new mongoose.Schema(
  {
    deal_id: { type: Number, required: false },
    deal_title: { type: String, required: true },
    deal_title_french: { type: String, required: true, default: "" },
    url_title: { type: String, required: true },
    deal_key: { type: String, required: true },
    deal_description: optionalString,
    deal_description_french: optionalString,
    brand_id: { type: Number, required: true, default: 1 },
    terms_conditions: optionalString,
    meta_description: optionalString,
    meta_keywords: optionalString,
    meta_description_french: optionalString,
    meta_keywords_french: optionalString,
    category_ids: optionalString,
    category_id: { type: Number, required: true, default: 0 },
    sub_category_id: { type: Number, required: true, default: 0 },
    sec_category_id: { type: Number, required: true, default: 0 },
    third_category_id: { type: Number, required: true, default: 0 },
    deal_type: { type: Number, required: true, default: 1 },
    deal_value: { type: Number, required: true, default: 0 },
    deal_price: { type: Number, required: true, default: 0 },
    deal_savings: { type: Number, required: true, default: 0 },
    shop_id: { type: Number, required: true, default: 1 },
    deal_percentage: { type: Number, required: true, default: 0 },
    purchase_count: { type: Number, required: true, default: 0 },
    user_limit_quantity: { type: Number, required: true, default: 0 },
    created_date: { type: Number, required: true },
    created_by: { type: Number, required: true, default: 1 },
    deal_status: { type: Number, required: true, default: 1 },
    delivery_period: { type: String, required: true, default: "2-3 days" },
    view_count: { type: Number, required: true, default: 0 },
    attribute: { type: Number, required: true, default: 0 },
    deal_feature: { type: Number, required: true, default: 0 },
    combo_products: optionalString,
    combo_price: optionalString,
    event_id: { type: Number },
    tags: optionalString,
    cat_tags: optionalString,
    related_products: optionalString,
    is_customized: { type: Number, required: true, default: 0 },
    having_size_color: { type: Number, required: true, default: 0 },
    merchant_id: { type: Number, required: true, default: 1 },
    shipping: { type: Number, required: true, default: 0 },
    brand_names: { type: String, default: "Thunayyan" },
    supplier_names: optionalString,
    supplier_id: { type: Number, required: true, default: 0 },
    ballon_filling_option: optionalString,
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
