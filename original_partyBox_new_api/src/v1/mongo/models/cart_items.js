const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const cart_itemsSchema = new mongoose.Schema(
  {
    item_id: { type: Number, required: false },
    cart_id: { type: Number, required: false },
    cart_userid: { type: Number, required: false },
    is_item_customized: { type: Number, required: false },
    item_color: { type: String, default: "" },
    item_color_code: { type: String, default: "0" },
    item_size: { type: String, default: "" },
    color_name: { type: String, default: "" },
    size_name: { type: String, default: "" },
    item_quantity: { type: Number, required: false },
    item_custom_details: { type: String, default: "" },
    item_custom_image: { type: String, default: "" },
    deal_id: { type: Number, required: false },
    sub_product_id: { type: Number, required: false },
    deal_title: { type: String, default: "" },
    deal_title_french: { type: String, default: "" },
    url_title: { type: String, default: "" },
    deal_key: { type: String, default: "" },
    deal_description: { type: String, default: "" },
    deal_description_french: { type: String, default: "" },
    shop_id: { type: Number, required: false, default: 1 },
    deal_value: { type: Number, required: false },
    deal_price: { type: Number, required: false },
    deal_savings: { type: Number, required: false },
    deal_percentage: { type: Number, required: false },
    deal_status: { type: Number, required: false, default: 1 },
    created_date: { type: Date, required: false },
    error_message: { type: String, default: "" },
    errors: { type: Number, required: false },
    cart_transaction_status: { type: Number, required: false, default: 0 },
    admin_status: { type: Number, required: false, default: 0 },
    delivery_status: { type: Number, required: false },
    shipping_date: { type: Number, required: false },
    sku: { type: String, default: "" },
    quantity_update_status: { type: Number, required: false },
    filling_option: { type: Number, required: false, default: 0 },
    filling_price: { type: Number, default: 0 },
  },
  {
    collection: "cart_items",
    timestamps: false,
    strict: false,
    suppressReservedKeysWarning: true,
  }
);

cart_itemsSchema.pre("save", async function (next) {
  if (this.item_id == null) {
    this.item_id = await getNextSequence("cart_items");
  }
  next();
});

module.exports = mongoose.models.cart_items || mongoose.model("cart_items", cart_itemsSchema);
