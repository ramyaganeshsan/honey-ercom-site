const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const cartSchema = new mongoose.Schema(
  {
    cart_id: { type: Number, required: false },
    tax_amount: { type: Number, required: true, default: 0 },
    user_id: { type: Number, required: true },
    total_cart_items: { type: Number, required: true },
    total_cart_price: { type: Number, required: true },
    cancel_amount: { type: Number, required: true, default: 0 },
    is_cancel: { type: Number, required: true, default: 0 },
    delivery_type: { type: Number, required: true, default: 1 },
    delivery_price: { type: Number, required: true },
    delivery_period: { type: String, default: "1" },
    delivery_terms: { type: String, default: "" },
    delivery_terms_arabic: { type: String, default: "" },
    grand_total_price: { type: Number, required: true },
    created_on: { type: Number, required: true },
    cart_transaction_status: { type: Number, required: true },
    transaction_id: { type: Number, required: true },
    tracking_id: { type: String, default: "" },
    shipping_name: { type: String, default: "" },
    shipping_address: { type: String, default: "" },
    shipping_address1: { type: String, default: "" },
    shipping_phone: { type: String, default: "" },
    shipping_city: { type: String, default: "" },
    shipping_state: { type: String, default: "" },
    shipping_country: { type: String, default: "" },
    shipping_zip: { type: String, default: "" },
    shipping_date: { type: Number, required: true },
    transaction_date: { type: Number, required: true },
    shipping_time: { type: Number, required: true },
    billing_info: { type: String, default: "" },
    order_date: { type: Number, required: true },
    shipping_log: { type: String, default: "" },
    type: { type: Number, required: true },
    gateway_opened: { type: Boolean, required: true, default: false },
    gateway_opened_time: { type: Number, required: true },
    coupon_code: { type: String, default: "" },
    coupon_apply: { type: Number, required: true, default: 0 },
    wallet_apply: { type: Number, required: true, default: 0 },
    wallet_amount: { type: Number, required: true, default: 0 },
    coupon_percentage: { type: String, default: "0" },
    payment_status: { type: Number, required: true, default: 0 },
    notes: { type: String, default: "" },
    discount_amount: { type: Number, required: true, default: 0 },
    isPaymentFromTabby: { type: Number, required: true, default: 0 },
    promocode_dump: { type: String },
    // Checkout / payment / DHL fields (also allowed via strict:false)
    isPickupFromStore: { type: Number, default: 0 },
    isCashOnDelivery: { type: Number, default: 0 },
    paymentStatusCOD: { type: Number, default: 0 },
    isDHLShipment: { type: Number, default: 0 },
    DHLshippingCost: { type: Number, default: 0 },
    DHL_shipmet_trackingID: { type: String, default: "" },
    DHLShipmentStatus: { type: String, default: "" },
    DHLShipmentDescription: { type: String, default: "" },
    DHLShipmentStatusDate: { type: String, default: "" },
    DHLShipmentStatusTime: { type: String, default: "" },
    sessionID: { type: String, default: "" },
    isOrderFromSession: { type: Number, default: 0 },
    discount_type: { type: Number, default: 0 },
  },
  {
    collection: "cart",
    timestamps: false,
    strict: false,
  }
);

cartSchema.pre("save", async function (next) {
  if (this.cart_id == null) {
    this.cart_id = await getNextSequence("cart");
  }
  next();
});

module.exports = mongoose.models.cart || mongoose.model("cart", cartSchema);
