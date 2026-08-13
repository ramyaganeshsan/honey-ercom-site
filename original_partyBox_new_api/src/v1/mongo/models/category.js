const mongoose = require("mongoose");
const { getNextSequence } = require("../counters");
const { optionalString } = require("../schemaHelpers");

const categorySchema = new mongoose.Schema(
  {
    category_id: { type: Number, required: false },
    main_category_id: { type: Number, required: true, default: 0 },
    sub_category_id: { type: Number, required: true, default: 0 },
    category_name: { type: String, required: true },
    category_name_french: optionalString,
    category_description: optionalString,
    category_description_french: optionalString,
    submenu_content: optionalString,
    category_url: { type: String, required: true },
    category_icon: optionalString,
    category_image: optionalString,
    color_code: optionalString,
    category_mapping: optionalString,
    home_category_order: { type: Number, required: true, default: 0 },
    home_category: { type: Number, required: true, default: 0 },
    category_status: { type: Number, required: true, default: 1 },
    product: { type: Number, required: true, default: 1 },
    customize_type: { type: Number, required: true, default: 0 },
    type: { type: Number, required: true, default: 0 },
    sort_order: { type: Number, required: true, default: 0 },
    menu_sort_order: { type: Number, required: true, default: 0 },
    category_list_title: optionalString,
    category_list_description: optionalString,
    category_list_image: optionalString,
    home_banner_image: optionalString,
    home_banner_url: optionalString,
    discount_type: { type: Number, required: true, default: 0 },
    discount_value: { type: Number, required: true, default: 0 },
  },
  {
    collection: "category",
    timestamps: false,
  }
);

categorySchema.pre("validate", function (next) {
  if (!this.category_name_french) {
    this.category_name_french = this.category_name || "";
  }
  if (!this.category_list_title) {
    this.category_list_title = this.category_name || "";
  }
  next();
});

categorySchema.pre("save", async function (next) {
  if (this.category_id == null) {
    this.category_id = await getNextSequence("category");
  }
  next();
});

module.exports = mongoose.models.category || mongoose.model("category", categorySchema);
