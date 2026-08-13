const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");

const categorySchema = new mongoose.Schema(
  {
    category_id: { type: Number, required: false },
    main_category_id: { type: Number, required: true },
    sub_category_id: { type: Number, required: true },
    category_name: { type: String, required: true },
    category_name_french: { type: String, required: true },
    category_description: { type: String, required: true },
    category_description_french: { type: String, required: true },
    submenu_content: { type: String },
    category_url: { type: String, required: true },
    category_icon: { type: String, required: true },
    category_image: { type: String, required: true },
    color_code: { type: String, required: true },
    category_mapping: { type: String, required: true },
    home_category_order: { type: Number, required: true },
    home_category: { type: Number, required: true, default: 0 },
    category_status: { type: Number, required: true, default: 1 },
    product: { type: Number, required: true },
    customize_type: { type: Number, required: true },
    type: { type: Number, required: true },
    sort_order: { type: Number, required: true },
    menu_sort_order: { type: Number, required: true },
    category_list_title: { type: String, required: true },
    category_list_description: { type: String, required: true },
    category_list_image: { type: String, required: true },
    home_banner_image: { type: String },
    home_banner_url: { type: String },
    discount_type: { type: Number, required: true, default: 0 },
    discount_value: { type: Number, required: true, default: 0 },
  },
  {
    collection: "category",
    timestamps: false,
  }
);

categorySchema.pre("save", async function (next) {
  if (this.category_id == null) {
    this.category_id = await getNextSequence("category");
  }
  next();
});

module.exports = mongoose.models.category || mongoose.model("category", categorySchema);
