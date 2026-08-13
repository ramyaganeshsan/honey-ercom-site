const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const blogSchema = new mongoose.Schema(
  {
    blog_id: { type: Number, required: false },
    blog_title: { type: String, required: true },
    blog_title_french: { type: String, required: true },
    url_title: { type: String, required: true },
    user_id: { type: Number, required: true },
    blog_description: { type: String, required: true },
    blog_description_french: { type: String, required: true },
    category_id: { type: Number, required: true },
    meta_title: { type: String, required: true },
    meta_title_french: { type: String, required: true },
    meta_description: { type: String, required: true },
    meta_description_french: { type: String, required: true },
    meta_keywords: { type: String, required: true },
    meta_keywords_french: { type: String, required: true },
    tags: { type: String, required: true },
    allow_comments: { type: Number, required: true, default: 1 },
    comments_count: { type: Number, required: true },
    blog_views: { type: Number, required: true },
    blog_date: { type: Number, required: true },
    publish_status: { type: Number, required: true, default: 1 },
    blog_status: { type: Number, required: true, default: 1 },
  },
  {
    collection: "blog",
    timestamps: false,
  }
);

blogSchema.pre("save", async function (next) {
  if (this.blog_id == null) {
    this.blog_id = await getNextSequence("blog");
  }
  next();
});

module.exports = mongoose.models.blog || mongoose.model("blog", blogSchema);
