const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const storesSchema = new mongoose.Schema(
  {
    store_id: { type: Number, required: false },
    store_name: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    store_email: { type: String, required: true },
    password: { type: String, required: true },
    store_name_french: { type: String, required: true },
    store_url_title: { type: String, required: true },
    store_key: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String, required: true },
    address1_french: { type: String, required: true },
    address2_french: { type: String, required: true },
    city_id: { type: Number, required: true },
    country_id: { type: Number, required: true },
    store_state_id: { type: Number, required: true },
    phone_number: { type: String, required: true },
    zipcode: { type: String, required: true },
    website: { type: String, required: true },
    meta_keywords: { type: String, required: true },
    meta_description: { type: String, required: true },
    meta_keywords_french: { type: String, required: true },
    meta_description_french: { type: String, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    store_type: { type: Number, required: true },
    merchant_id: { type: Number, required: true },
    created_by: { type: Number, required: true },
    created_date: { type: Number, required: true },
    store_status: { type: Number, required: true, default: 1 },
  },
  {
    collection: "stores",
    timestamps: false,
  }
);

storesSchema.pre("save", async function (next) {
  if (this.store_id == null) {
    this.store_id = await getNextSequence("stores");
  }
  next();
});

module.exports = mongoose.models.stores || mongoose.model("stores", storesSchema);
