const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const blog_settingsSchema = new mongoose.Schema(
  {
    blog_settings_id: { type: Number, required: false },
    allow_comment_posting: { type: Number, required: true, default: 1 },
    require_adminapproval_comments: { type: Number, required: true, default: 1 },
    posts_per_page: { type: Number, required: true, default: 4 },
  },
  {
    collection: "blog_settings",
    timestamps: false,
  }
);

blog_settingsSchema.pre("save", async function (next) {
  if (this.blog_settings_id == null) {
    this.blog_settings_id = await getNextSequence("blog_settings");
  }
  next();
});

module.exports = mongoose.models.blog_settings || mongoose.model("blog_settings", blog_settingsSchema);
