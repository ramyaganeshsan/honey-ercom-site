const mongoose = require("mongoose");

const facebook_shopSchema = new mongoose.Schema(
  {
    user_id: { type: Number, required: true },
    user_type: { type: Number, required: true },
    fb_uid: { type: String, required: true },
    fb_name: { type: String, required: true },
    fb_access_token: { type: String, required: true },
    fb_pages_data: { type: String, required: true },
    fb_connected_page: { type: String, required: true },
  },
  {
    collection: "facebook_shop",
    timestamps: false,
  }
);

module.exports = mongoose.models.facebook_shop || mongoose.model("facebook_shop", facebook_shopSchema);
