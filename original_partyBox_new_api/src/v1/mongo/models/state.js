const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const stateSchema = new mongoose.Schema(
  {
    state_id: { type: Number, required: false },
    state_name: { type: String, required: true },
    state_name_arabic: { type: String, required: true },
    state_url: { type: String, required: true },
    state_country_id: { type: Number, required: true },
    statestatus: { type: Number, required: true },
  },
  {
    collection: "state",
    timestamps: false,
  }
);

stateSchema.pre("save", async function (next) {
  if (this.state_id == null) {
    this.state_id = await getNextSequence("state");
  }
  next();
});

module.exports = mongoose.models.state || mongoose.model("state", stateSchema);
