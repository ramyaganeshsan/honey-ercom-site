const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const promocodesSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: Number, required: true },
    code: { type: String, required: true },
    discount: { type: Number, required: true },
    type: { type: Number, required: true },
    starts_at: { type: Date },
    expires_at: { type: Date },
    usage_limit: { type: Number },
    usage_count: { type: Number },
    created_by: { type: Number },
    updated_by: { type: Number },
    user_ids: { type: String },
    show_promo: { type: Number, required: true, default: 0 },
    minpromotype: { type: Number, required: true, default: 0 },
    minimum_total: { type: Number, required: true, default: 0 },
  },
  {
    collection: "promocodes",
    timestamps: false,
  }
);

promocodesSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("promocodes");
  }
  next();
});

module.exports = mongoose.models.promocodes || mongoose.model("promocodes", promocodesSchema);
