const { findOne, create, updateOne, findAll } = require("../../mongo/repo");
const { ok, fail, listCollection } = require("../services/admin.helpers");

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "category";
}

exports.listCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category_status !== undefined && req.query.category_status !== "") {
      filter.category_status = Number(req.query.category_status);
    }
    // Return all for tree building when no paging requested
    if (req.query.page || req.query.limit) {
      const data = await listCollection("category", filter, req.query, {
        order: [["sort_order", "ASC"]],
      });
      return res.send(ok(data));
    }
    const items = await findAll("category", filter, {
      order: [["sort_order", "ASC"]],
    });
    return res.send(ok({ items, total: items.length }));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list categories"));
  }
};

exports.createCategory = async (req, res) => {
  try {
    const body = req.body || {};
    const category_name = String(body.category_name || "").trim();
    if (!category_name) {
      return res.send(fail("category_name is required"));
    }

    const category = await create("category", {
      main_category_id: Number(body.main_category_id) || 0,
      sub_category_id: Number(body.sub_category_id) || 0,
      category_name,
      category_name_french: String(body.category_name_french || category_name),
      category_description: String(body.category_description || ""),
      category_description_french: String(body.category_description_french || ""),
      category_url: String(body.category_url || slugify(category_name)),
      category_icon: String(body.category_icon || ""),
      category_image: String(body.category_image || ""),
      color_code: String(body.color_code || ""),
      category_mapping: String(body.category_mapping || ""),
      home_category_order: Number(body.home_category_order) || 0,
      home_category: Number(body.home_category) || 0,
      category_status: body.category_status !== undefined ? Number(body.category_status) : 1,
      product: Number(body.product) || 1,
      customize_type: Number(body.customize_type) || 0,
      type: Number(body.type) || 0,
      sort_order: Number(body.sort_order) || 0,
      menu_sort_order: Number(body.menu_sort_order) || 0,
      category_list_title: String(body.category_list_title || category_name),
      category_list_description: String(body.category_list_description || ""),
      category_list_image: String(body.category_list_image || ""),
      discount_type: Number(body.discount_type) || 0,
      discount_value: Number(body.discount_value) || 0,
    });

    return res.send(ok(category, "Category created"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to create category"));
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.categoryId);
    const body = { ...(req.body || {}) };
    delete body.category_id;
    delete body._id;

    const updated = await updateOne("category", { category_id: categoryId }, body);
    if (!updated) {
      return res.send(fail("Category not found"));
    }
    return res.send(ok(updated, "Category updated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update category"));
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.categoryId);
    const updated = await updateOne(
      "category",
      { category_id: categoryId },
      { category_status: 0 }
    );
    if (!updated) {
      return res.send(fail("Category not found"));
    }
    return res.send(ok(updated, "Category deactivated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to delete category"));
  }
};

exports.getCategory = async (req, res) => {
  try {
    const category = await findOne("category", {
      category_id: Number(req.params.categoryId),
    });
    if (!category) {
      return res.send(fail("Category not found"));
    }
    return res.send(ok(category));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load category"));
  }
};
