const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const temp_transactionSchema = new mongoose.Schema(
  {
    temp_id: { type: Number, required: false },
    temp_data: { type: String, required: true },
    randvar: { type: String, required: true },
    type: { type: Number, required: true, default: 1 },
    status: { type: Number, required: true, default: 0 },
  },
  {
    collection: "temp_transaction",
    timestamps: false,
  }
);

temp_transactionSchema.pre("save", async function (next) {
  if (this.temp_id == null) {
    this.temp_id = await getNextSequence("temp_transaction");
  }
  next();
});

module.exports = mongoose.models.temp_transaction || mongoose.model("temp_transaction", temp_transactionSchema);
