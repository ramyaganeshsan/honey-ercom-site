const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

/** Allow empty strings — mongoose `required: true` rejects "". */
const optionalString = { type: String, default: "" };

const productSchema = new mongoose.Schema(
  {
    deal_id: { type: Number, required: false },
    /** Merchant SKU / Item No# — unique when set; distinct from Mongo _id / deal_id */
    item_no: { type: String, default: "", trim: true },
    deal_title: { type: String, required: true },
    deal_title_french: optionalString,
    url_title: { type: String, required: true },
    deal_key: { type: String, required: true },
    deal_description: optionalString,
    deal_description_french: optionalString,
    material: optionalString,
    dimension: optionalString,
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
    brand_names: { type: String, default: "GOZO HOME" },
    supplier_names: optionalString,
    supplier_id: { type: Number, required: true, default: 0 },
    ballon_filling_option: optionalString,
  },
  {
    collection: "product",
    timestamps: false,
  }
);

productSchema.pre("validate", function (next) {
  if (!this.deal_title_french) {
    this.deal_title_french = this.deal_title || "";
  }
  if (this.item_no != null) {
    this.item_no = String(this.item_no).trim();
  }
  next();
});

productSchema.pre("save", async function (next) {
  if (this.deal_id == null) {
    this.deal_id = await getNextSequence("product");
  }
  next();
});

/** Sparse unique: empty item_no allowed many times; non-empty values must be unique */
productSchema.index(
  { item_no: 1 },
  {
    unique: true,
    partialFilterExpression: { item_no: { $type: "string", $gt: "" } },
  }
);

module.exports = mongoose.models.product || mongoose.model("product", productSchema);
