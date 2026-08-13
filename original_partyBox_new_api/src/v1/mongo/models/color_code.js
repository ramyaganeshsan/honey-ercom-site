const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const color_codeSchema = new mongoose.Schema(
  {
    id: { type: Number, required: false },
    color_code: { type: String, required: true },
    color_name: { type: String, required: true },
    main_category_id: { type: Number, required: true },
  },
  {
    collection: "color_code",
    timestamps: false,
  }
);

color_codeSchema.pre("save", async function (next) {
  if (this.id == null) {
    this.id = await getNextSequence("color_code");
  }
  next();
});

module.exports = mongoose.models.color_code || mongoose.model("color_code", color_codeSchema);
