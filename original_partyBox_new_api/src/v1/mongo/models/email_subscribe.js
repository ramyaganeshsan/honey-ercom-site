const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const email_subscribeSchema = new mongoose.Schema(
  {
    subscribe_id: { type: Number, required: false },
    user_id: { type: Number, required: true },
    email_id: { type: String, required: true },
    country_id: { type: String, required: true },
    city_id: { type: String, required: true },
    category_id: { type: String, required: true },
    gender: { type: Number, required: true },
    suscribe_city_status: { type: Number, required: true, default: 1 },
    suscribe_status: { type: Number, required: true, default: 1 },
    is_deleted: { type: Number, required: true },
  },
  {
    collection: "email_subscribe",
    timestamps: false,
  }
);

email_subscribeSchema.pre("save", async function (next) {
  if (this.subscribe_id == null) {
    this.subscribe_id = await getNextSequence("email_subscribe");
  }
  next();
});

module.exports = mongoose.models.email_subscribe || mongoose.model("email_subscribe", email_subscribeSchema);
