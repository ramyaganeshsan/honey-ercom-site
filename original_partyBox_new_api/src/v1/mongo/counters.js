const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  {
    collection: "counters",
    timestamps: false,
  }
);

const Counter =
  mongoose.models.counters || mongoose.model("counters", counterSchema);

/**
 * Atomically increment and return the next sequence number for a named counter.
 * Typically collectionName is used as the counter name (e.g. "users", "product").
 * @param {string} name
 * @returns {Promise<number>}
 */
async function getNextSequence(name) {
  const doc = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc.seq;
}

module.exports = {
  Counter,
  getNextSequence,
};
