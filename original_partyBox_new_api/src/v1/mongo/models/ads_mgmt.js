const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const ads_mgmtSchema = new mongoose.Schema(
  {
    ads_id: { type: Number, required: false },
    ads_type: { type: Number, required: true, default: 1 },
    ads_title: { type: String, required: true },
    ads_title_french: { type: String, required: true },
    ads_keyword: { type: String, required: true },
    ads_image: { type: String, required: true },
    ads_width: { type: String, required: true },
    ads_height: { type: String, required: true },
    redirect_url: { type: String, required: true },
    status: { type: Number, required: true, default: 1 },
    created_date: { type: Date, required: true },
  },
  {
    collection: "ads_mgmt",
    timestamps: false,
  }
);

ads_mgmtSchema.pre("save", async function (next) {
  if (this.ads_id == null) {
    this.ads_id = await getNextSequence("ads_mgmt");
  }
  next();
});

module.exports = mongoose.models.ads_mgmt || mongoose.model("ads_mgmt", ads_mgmtSchema);
