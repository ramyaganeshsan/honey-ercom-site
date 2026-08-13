const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const posSchema = new mongoose.Schema(
  {
    pos_id: { type: Number, required: false },
    pos_firstname: { type: String, required: true },
    pos_lastname: { type: String, required: true },
    pos_email: { type: String, required: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: String, required: true },
    postal_code: { type: String, required: true },
    country_id: { type: Number, required: true },
    city_id: { type: Number, required: true },
    pos_user_status: { type: Number, required: true },
    owner_id: { type: Number, required: true },
    created_date: { type: Date, required: true },
  },
  {
    collection: "pos",
    timestamps: false,
  }
);

posSchema.pre("save", async function (next) {
  if (this.pos_id == null) {
    this.pos_id = await getNextSequence("pos");
  }
  next();
});

module.exports = mongoose.models.pos || mongoose.model("pos", posSchema);
