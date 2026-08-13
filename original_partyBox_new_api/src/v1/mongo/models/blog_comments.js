const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const blog_commentsSchema = new mongoose.Schema(
  {
    comments_id: { type: Number, required: false },
    name: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: true },
    comments: { type: String, required: true },
    blogg_id: { type: Number, required: true },
    approve_status: { type: Number, required: true, default: 0 },
    comments_date: { type: Number, required: true },
    notify_comments: { type: Number, required: true, default: 0 },
    comments_status: { type: Number, required: true, default: 1 },
  },
  {
    collection: "blog_comments",
    timestamps: false,
  }
);

blog_commentsSchema.pre("save", async function (next) {
  if (this.comments_id == null) {
    this.comments_id = await getNextSequence("blog_comments");
  }
  next();
});

module.exports = mongoose.models.blog_comments || mongoose.model("blog_comments", blog_commentsSchema);
