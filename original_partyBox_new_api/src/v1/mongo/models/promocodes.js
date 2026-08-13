const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");
const { optionalString } = require("../schemaHelpers");

const promocodesSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    title: { type: String, required: true },
    description: optionalString,
    status: { type: Number, required: true, default: 1 },
    code: { type: String, required: true },
    discount: { type: Number, required: true, default: 0 },
    type: { type: Number, required: true, default: 1 },
    starts_at: { type: Date },
    expires_at: { type: Date },
    usage_limit: { type: Number, default: 0 },
    usage_count: { type: Number, default: 0 },
    created_by: { type: Number, default: 0 },
    updated_by: { type: Number, default: 0 },
    user_ids: optionalString,
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

module.exports =
  mongoose.models.promocodes || mongoose.model("promocodes", promocodesSchema);
