const { findOne, create, updateOne, findAll } = require("../../mongo/repo");
const { getCurrentTime, generateRandomString } = require("../../utils/index");
const { ok, fail, failFromError, listCollection } = require("../services/admin.helpers");
const { saveProductImage, listProductImageIndexes } = require("../services/upload.service");
const { PRODUCT_DISPLAY_IMAGE } = require("../../utils/constants");

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "product";
}

function productDefaults(body = {}) {
  const now = getCurrentTime().unix();
  const title = String(body.deal_title || "").trim();
  // deal_value = original/MRP; deal_price = sale/discount price
  const deal_value = Number(body.deal_value) || Number(body.deal_price) || 0;
  const deal_price =
    body.deal_price !== undefined && body.deal_price !== ""
      ? Number(body.deal_price) || 0
      : deal_value;
  const deal_savings = Math.max(0, deal_value - deal_price);
  const deal_percentage =
    deal_value > 0 ? Math.round((deal_savings / deal_value) * 100) : 0;
  const deal_key =
    String(body.deal_key || "").trim() ||
    `${slugify(title)}-${generateRandomString(4)}`.slice(0, 40);
  const stock =
    body.user_limit_quantity !== undefined && body.user_limit_quantity !== ""
      ? Number(body.user_limit_quantity)
      : body.stock !== undefined && body.stock !== ""
        ? Number(body.stock)
        : body.quantity !== undefined && body.quantity !== ""
          ? Number(body.quantity)
          : 0;

  return {
    deal_title: title,
    deal_title_french: String(body.deal_title_french || title),
    url_title: String(body.url_title || slugify(title)),
    deal_key,
    deal_description: String(body.deal_description || ""),
    deal_description_french: String(body.deal_description_french || ""),
    brand_id: Number(body.brand_id) || 1,
    terms_conditions: String(body.terms_conditions || ""),
    meta_description: String(body.meta_description || ""),
    meta_keywords: String(body.meta_keywords || ""),
    meta_description_french: String(body.meta_description_french || ""),
    meta_keywords_french: String(body.meta_keywords_french || ""),
    category_ids: String(body.category_ids || body.category_id || ""),
    category_id: Number(body.category_id) || 0,
    sub_category_id: Number(body.sub_category_id) || 0,
    sec_category_id: Number(body.sec_category_id) || 0,
    third_category_id: Number(body.third_category_id) || 0,
    deal_type: Number(body.deal_type) || 1,
    deal_value,
    deal_price,
    deal_savings,
    shop_id: Number(body.shop_id) || 1,
    deal_percentage,
    purchase_count: Number(body.purchase_count) || 0,
    user_limit_quantity: Number.isFinite(stock) ? stock : 0,
    created_date: now,
    created_by: Number(body.created_by) || 1,
    deal_status: body.deal_status !== undefined ? Number(body.deal_status) : 1,
    delivery_period: String(body.delivery_period || "2-3 days"),
    view_count: Number(body.view_count) || 0,
    attribute: Number(body.attribute) || 0,
    deal_feature: Number(body.deal_feature) || 0,
    combo_products: String(body.combo_products || ""),
    combo_price: String(body.combo_price || ""),
    tags: String(body.tags || ""),
    cat_tags: String(body.cat_tags || ""),
    related_products: String(body.related_products || ""),
    is_customized: Number(body.is_customized) || 0,
    having_size_color: Number(body.having_size_color) || 0,
    merchant_id: Number(body.merchant_id) || 1,
    shipping: Number(body.shipping) || 0,
    brand_names: String(body.brand_names || "Thunayyan"),
    supplier_names: String(body.supplier_names || ""),
    supplier_id: Number(body.supplier_id) || 0,
    ballon_filling_option: String(body.ballon_filling_option || ""),
  };
}

async function syncSubProduct(dealId, product, body = {}) {
  const quantity =
    body.quantity !== undefined
      ? Number(body.quantity)
      : Number(product.user_limit_quantity) || 0;
  const price =
    body.price !== undefined ? Number(body.price) : Number(product.deal_price) || 0;
  const discount =
    body.discount !== undefined
      ? Number(body.discount)
      : Number(product.deal_value) || price;

  const existing = await findOne("sub_products", { product_id: dealId });
  if (existing) {
    return updateOne(
      "sub_products",
      { product_id: dealId },
      {
        quantity,
        price,
        discount,
        product_key: product.deal_key,
        updated_date: getCurrentTime().unix(),
      }
    );
  }

  return create("sub_products", {
    product_id: dealId,
    deal_id: dealId,
    size_id: 0,
    color_id: 0,
    quantity,
    price,
    discount,
    product_key: product.deal_key,
    product_image: String(body.product_image || `${product.deal_key}_1.png`),
    sku: String(body.sku || `SKU-${dealId}`),
    created_date: getCurrentTime().unix(),
    status: 1,
  });
}

exports.listProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.deal_status !== undefined && req.query.deal_status !== "") {
      filter.deal_status = Number(req.query.deal_status);
    }
    if (req.query.status !== undefined && req.query.status !== "") {
      filter.deal_status = Number(req.query.status);
    }
    if (req.query.category_id !== undefined && req.query.category_id !== "") {
      const catId = Number(req.query.category_id);
      filter.$or = [
        { category_id: catId },
        { category_ids: { $regex: `(^|,)${catId}(,|$)` } },
      ];
    }
    const q = String(req.query.search || req.query.q || "").trim();
    if (q) {
      const rx = { $regex: q, $options: "i" };
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { deal_title: rx },
            { deal_title_french: rx },
            { deal_key: rx },
            { tags: rx },
          ],
        },
      ];
    }

    const data = await listCollection("product", filter, req.query, {
      order: [["deal_id", "DESC"]],
    });
    return res.send(ok(data));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to list products"));
  }
};

function productImagePayload(dealKey) {
  const indexes = listProductImageIndexes(dealKey);
  const images = indexes.map((index) => ({
    index,
    filename: `${dealKey}_${index}.png`,
    url: `${PRODUCT_DISPLAY_IMAGE}${dealKey}_${index}.png`,
  }));
  return {
    image_indexes: indexes,
    images,
    image_count: images.length,
  };
}

exports.getProduct = async (req, res) => {
  try {
    const dealId = Number(req.params.dealId);
    const product = await findOne("product", { deal_id: dealId });
    if (!product) {
      return res.send(fail("Product not found"));
    }
    const subProducts = await findAll("sub_products", { product_id: dealId });
    return res.send(
      ok({
        ...product,
        sub_products: subProducts,
        ...productImagePayload(product.deal_key),
      })
    );
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to load product"));
  }
};

exports.createProduct = async (req, res) => {
  try {
    const body = req.body || {};
    if (!String(body.deal_title || "").trim()) {
      return res.send(fail("deal_title is required"));
    }
    const payload = productDefaults(body);
    if (!payload.url_title) {
      payload.url_title = slugify(payload.deal_title);
    }
    const product = await create("product", payload);
    await syncSubProduct(product.deal_id, product, body);
    const subProducts = await findAll("sub_products", {
      product_id: product.deal_id,
    });
    return res.send(ok({ ...product, sub_products: subProducts }, "Product created"));
  } catch (err) {
    console.error(err);
    return res.send(failFromError(err, "Failed to create product"));
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const dealId = Number(req.params.dealId);
    const body = { ...(req.body || {}) };
    delete body.deal_id;
    delete body._id;
    delete body.created_date;

    if (body.stock !== undefined && body.user_limit_quantity === undefined) {
      body.user_limit_quantity = Number(body.stock) || 0;
      delete body.stock;
    }
    if (body.quantity !== undefined && body.user_limit_quantity === undefined) {
      body.user_limit_quantity = Number(body.quantity) || 0;
    }
    if (body.category_id !== undefined && body.category_ids === undefined) {
      body.category_ids = String(body.category_id);
    }

    if (body.deal_value != null || body.deal_price != null) {
      const existing = await findOne("product", { deal_id: dealId });
      if (!existing) {
        return res.send(fail("Product not found"));
      }
      const deal_value = Number(body.deal_value ?? existing.deal_value) || 0;
      const deal_price = Number(body.deal_price ?? existing.deal_price) || 0;
      body.deal_value = deal_value;
      body.deal_price = deal_price;
      body.deal_savings = Math.max(0, deal_value - deal_price);
      body.deal_percentage =
        deal_value > 0 ? Math.round((body.deal_savings / deal_value) * 100) : 0;
    }

    const updated = await updateOne("product", { deal_id: dealId }, body);
    if (!updated) {
      return res.send(fail("Product not found"));
    }

    if (
      body.user_limit_quantity !== undefined ||
      body.deal_price !== undefined ||
      body.deal_value !== undefined ||
      body.quantity !== undefined ||
      body.price !== undefined
    ) {
      await syncSubProduct(dealId, updated, body);
    }

    const subProducts = await findAll("sub_products", { product_id: dealId });
    return res.send(ok({ ...updated, sub_products: subProducts }, "Product updated"));
  } catch (err) {
    console.error(err);
    return res.send(failFromError(err, "Failed to update product"));
  }
};

exports.uploadProductImage = async (req, res) => {
  try {
    const dealId = Number(req.params.dealId);
    const product = await findOne("product", { deal_id: dealId });
    if (!product) {
      return res.send(fail("Product not found"));
    }
    if (!req.file?.buffer) {
      return res.send(fail("Image file is required (field name: image)"));
    }

    const index = req.body?.index ?? req.query?.index ?? 1;
    const saved = await saveProductImage(
      product.deal_key,
      req.file.buffer,
      index
    );
    const product_image = saved.filename;

    // Keep primary (_1) as the catalog / cart thumbnail reference
    if (saved.index === 1) {
      await syncSubProduct(dealId, product, {
        product_image,
        quantity: product.user_limit_quantity,
        price: product.deal_price,
        discount: product.deal_value,
      });
    }

    const subProducts = await findAll("sub_products", { product_id: dealId });
    return res.send(
      ok(
        {
          deal_id: dealId,
          deal_key: product.deal_key,
          product_image,
          image_index: saved.index,
          image_url: saved.relativeUrl,
          sub_products: subProducts,
          ...productImagePayload(product.deal_key),
        },
        `Product image ${saved.index} uploaded`
      )
    );
  } catch (err) {
    console.error(err);
    return res.send(fail(err.message || "Failed to upload product image"));
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const dealId = Number(req.params.dealId);
    const updated = await updateOne(
      "product",
      { deal_id: dealId },
      { deal_status: 0 }
    );
    if (!updated) {
      return res.send(fail("Product not found"));
    }
    return res.send(ok(updated, "Product deactivated"));
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to delete product"));
  }
};

exports.updateProductStatus = async (req, res) => {
  try {
    const dealId = Number(req.params.dealId);
    const deal_status = Number(
      req.body?.deal_status ?? req.body?.status
    );
    if (Number.isNaN(deal_status)) {
      return res.send(fail("deal_status is required"));
    }
    const updated = await updateOne(
      "product",
      { deal_id: dealId },
      { deal_status }
    );
    if (!updated) {
      return res.send(fail("Product not found"));
    }
    return res.send(
      ok({ deal_id: updated.deal_id, deal_status: updated.deal_status }, "Status updated")
    );
  } catch (err) {
    console.error(err);
    return res.send(fail("Failed to update product status"));
  }
};
