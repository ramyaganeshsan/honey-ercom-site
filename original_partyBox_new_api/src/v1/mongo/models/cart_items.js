const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const cart_itemsSchema = new mongoose.Schema(
  {
    item_id: { type: Number, required: false },
    cart_id: { type: Number, required: true },
    cart_userid: { type: Number, required: true },
    is_item_customized: { type: Number, required: true },
    item_color: { type: String, required: true },
    item_color_code: { type: String, default: "0" },
    item_size: { type: String, required: true },
    color_name: { type: String, required: true },
    size_name: { type: String, required: true },
    item_quantity: { type: Number, required: true },
    item_custom_details: { type: String, required: true },
    item_custom_image: { type: String, required: true },
    deal_id: { type: Number, required: true },
    sub_product_id: { type: Number, required: true },
    deal_title: { type: String, required: true },
    deal_title_french: { type: String, required: true },
    url_title: { type: String, required: true },
    deal_key: { type: String, required: true },
    deal_description: { type: String, required: true },
    deal_description_french: { type: String, required: true },
    shop_id: { type: Number, required: true, default: 1 },
    deal_value: { type: Number, required: true },
    deal_price: { type: Number, required: true },
    deal_savings: { type: Number, required: true },
    deal_percentage: { type: Number, required: true },
    deal_status: { type: Number, required: true, default: 1 },
    created_date: { type: Date, required: true },
    error_message: { type: String, required: true },
    errors: { type: Number, required: true },
    cart_transaction_status: { type: Number, required: true, default: 0 },
    admin_status: { type: Number, required: true, default: 0 },
    delivery_status: { type: Number, required: true },
    shipping_date: { type: Number, required: true },
    sku: { type: String, required: true },
    quantity_update_status: { type: Number, required: true },
    filling_option: { type: Number, required: true, default: 0 },
    filling_price: { type: Number, default: 0 },
  },
  {
    collection: "cart_items",
    timestamps: false,
  }
);

cart_itemsSchema.pre("save", async function (next) {
  if (this.item_id == null) {
    this.item_id = await getNextSequence("cart_items");
  }
  next();
});

module.exports = mongoose.models.cart_items || mongoose.model("cart_items", cart_itemsSchema);
