const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const users_products_notificationSchema = new mongoose.Schema(
  {
    users_products_notification_id: { type: Number, required: false },
    user_id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    product_title: { type: String, required: true },
    created_date: { type: Date, required: true },
  },
  {
    collection: "users_products_notification",
    timestamps: false,
  }
);

users_products_notificationSchema.pre("save", async function (next) {
  if (this.users_products_notification_id == null) {
    this.users_products_notification_id = await getNextSequence("users_products_notification");
  }
  next();
});

module.exports = mongoose.models.users_products_notification || mongoose.model("users_products_notification", users_products_notificationSchema);
