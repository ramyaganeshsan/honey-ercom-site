const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const contactSchema = new mongoose.Schema(
  {
    contact_id: { type: Number, required: false },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: Number, required: true, default: 1 },
  },
  {
    collection: "contact",
    timestamps: false,
  }
);

contactSchema.pre("save", async function (next) {
  if (this.contact_id == null) {
    this.contact_id = await getNextSequence("contact");
  }
  next();
});

module.exports = mongoose.models.contact || mongoose.model("contact", contactSchema);
