const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const attribute_groupSchema = new mongoose.Schema(
  {
    attribute_group_id: { type: Number, required: false },
    groupname: { type: String, required: true },
    groupname_french: { type: String, required: true },
    sort_order: { type: Number, required: true },
  },
  {
    collection: "attribute_group",
    timestamps: false,
  }
);

attribute_groupSchema.pre("save", async function (next) {
  if (this.attribute_group_id == null) {
    this.attribute_group_id = await getNextSequence("attribute_group");
  }
  next();
});

module.exports = mongoose.models.attribute_group || mongoose.model("attribute_group", attribute_groupSchema);
