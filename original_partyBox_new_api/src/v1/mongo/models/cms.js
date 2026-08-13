const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const cmsSchema = new mongoose.Schema(
  {
    cms_id: { type: Number, required: false },
    cms_title: { type: String, required: true },
    cms_title_french: { type: String, required: true },
    cms_url: { type: String, required: true },
    cms_desc: { type: String, required: true },
    cms_desc_french: { type: String, required: true },
    type: { type: Number, required: true, default: 0 },
    cms_status: { type: Number, required: true, default: 1 },
  },
  {
    collection: "cms",
    timestamps: false,
  }
);

cmsSchema.pre("save", async function (next) {
  if (this.cms_id == null) {
    this.cms_id = await getNextSequence("cms");
  }
  next();
});

module.exports = mongoose.models.cms || mongoose.model("cms", cmsSchema);
