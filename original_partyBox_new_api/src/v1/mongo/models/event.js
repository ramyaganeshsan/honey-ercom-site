const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const eventSchema = new mongoose.Schema(
  {
    event_id: { type: Number, required: false },
    name_eng: { type: String, required: true },
    name_ar: { type: String, required: true },
    event_image: { type: String, required: true },
    status: { type: Number, required: true },
  },
  {
    collection: "event",
    timestamps: false,
  }
);

eventSchema.pre("save", async function (next) {
  if (this.event_id == null) {
    this.event_id = await getNextSequence("event");
  }
  next();
});

module.exports = mongoose.models.event || mongoose.model("event", eventSchema);
