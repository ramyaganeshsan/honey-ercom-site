const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const users_access_tokenSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    merchant_id: { type: Number, required: true },
    access_type: { type: String, required: true },
    access_key: { type: String, required: true },
    access_title: { type: String, required: true },
    approved: { type: Number, required: true, default: 0 },
    is_deleted: { type: Number, required: true, default: 0 },
  },
  {
    collection: "users_access_token",
    timestamps: false,
  }
);

users_access_tokenSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("users_access_token");
  }
  next();
});

module.exports = mongoose.models.users_access_token || mongoose.model("users_access_token", users_access_tokenSchema);
