const { findOne, create, updateOne, findAll } = require("../../mongo/repo");
const { getCurrentTime, generateRandomString } = require("../../utils/index");
const { ok, fail, failFromError, listCollection } = require("../services/admin.helpers");
const {
  saveProductImage,
  listProductImageIndexes,
  MAX_PRODUCT_IMAGES,
} = require("../services/upload.service");
const { PRODUCT_DISPLAY_IMAGE } = require("../../utils/constants");

/** Lazy-load so API can boot; clear error if npm install was skipped */
function requireBulkLibs() {
  try {
    return {
      ExcelJS: require("exceljs"),
      AdmZip: require("adm-zip"),
    };
  } catch (err) {
    const missing = err?.message || "exceljs / adm-zip";
    const e = new Error(
      `Bulk upload packages missing (${missing}). In original_partyBox_new_api run: npm install`
    );
    e.code = "BULK_DEPS_MISSING";
    throw e;
  }
}

/**
 * Excel columns — Image_1…Image_8 are for INSERTING pictures in the sheet
 * (same idea as Add product gallery slots), not links.
 */
const BULK_COLUMNS = [
  "Item No#",
  "Product Name (EN)",
  "Product Name (AR)",
  "Description (EN)",
  "Description (AR)",
  "Material",
  "Dimension",
  "Original Price",
  "Discount Price",
  "Stock",
  "Image_1",
  "Image_2",
  "Image_3",
  "Image_4",
  "Image_5",
  "Image_6",
  "Image_7",
  "Image_8",
];

const BULK_HEADER_ALIASES = {
  "item no#": "Item No#",
  "item no": "Item No#",
  "item_no": "Item No#",
  "item number": "Item No#",
  "sku": "Item No#",
  "product name (en)": "Product Name (EN)",
  "product name en": "Product Name (EN)",
  "name (en)": "Product Name (EN)",
  "name en": "Product Name (EN)",
  "deal_title": "Product Name (EN)",
  "product name (ar)": "Product Name (AR)",
  "product name ar": "Product Name (AR)",
  "name (ar)": "Product Name (AR)",
  "name ar": "Product Name (AR)",
  "deal_title_french": "Product Name (AR)",
  "description (en)": "Description (EN)",
  "description en": "Description (EN)",
  "deal_description": "Description (EN)",
  "description (ar)": "Description (AR)",
  "description ar": "Description (AR)",
  "deal_description_french": "Description (AR)",
  "material": "Material",
  "dimension": "Dimension",
  "dimensions": "Dimension",
  "original price": "Original Price",
  "original_price": "Original Price",
  "mrp": "Original Price",
  "deal_value": "Original Price",
  "discount price": "Discount Price",
  "discount_price": "Discount Price",
  "sale price": "Discount Price",
  "deal_price": "Discount Price",
  "stock": "Stock",
  "quantity": "Stock",
  "user_limit_quantity": "Stock",
  "image_1": "Image_1",
  "image1": "Image_1",
  "image 1": "Image_1",
  "image_2": "Image_2",
  "image2": "Image_2",
  "image 2": "Image_2",
  "image_3": "Image_3",
  "image3": "Image_3",
  "image 3": "Image_3",
  "image_4": "Image_4",
  "image4": "Image_4",
  "image 4": "Image_4",
  "image_5": "Image_5",
  "image5": "Image_5",
  "image 5": "Image_5",
  "image_6": "Image_6",
  "image6": "Image_6",
  "image 6": "Image_6",
  "image_7": "Image_7",
  "image7": "Image_7",
  "image 7": "Image_7",
  "image_8": "Image_8",
  "image8": "Image_8",
  "image 8": "Image_8",
};

function normalizeBulkHeader(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (BULK_HEADER_ALIASES[key]) return BULK_HEADER_ALIASES[key];
  const compact = key.replace(/[\s_-]+/g, "");
  if (/^image[1-8]$/.test(compact)) {
    return `Image_${compact.replace("image", "")}`;
  }
  return String(raw || "").trim();
}

function cellText(value) {
  if (value == null || value === "") return "";
  if (typeof value === "object") {
    if (value.text != null) return String(value.text).trim();
    if (value.result != null) return String(value.result).trim();
    if (value.richText) {
      return value.richText.map((t) => t.text || "").join("").trim();
    }
    if (value.hyperlink && value.text) return String(value.text).trim();
  }
  return String(value).trim();
}

function cellNumber(value) {
  const raw = cellText(value);
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function buildZipImageIndex(zipBuffer, AdmZip) {
  /** Map: lowercase "itemno_slot" → Buffer — optional fallback only */
  const map = new Map();
  if (!zipBuffer || !zipBuffer.length) return map;
  const zip = new AdmZip(zipBuffer);
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;
    const base = entry.entryName.split(/[/\\]/).pop() || "";
    const m = base.match(/^(.+?)[_-](\d)\.(jpe?g|png|webp|gif)$/i);
    if (!m) continue;
    const itemNo = String(m[1]).trim().toLowerCase();
    const slot = Number(m[2]);
    if (!itemNo || slot < 1 || slot > MAX_PRODUCT_IMAGES) continue;
    map.set(`${itemNo}_${slot}`, entry.getData());
  }
  return map;
}

/**
 * Read product rows + pictures inserted into Image_1…Image_8 cells.
 * Matching: each picture’s position (row + column) = that product’s gallery slot.
 */
async function parseBulkExcel(buffer, ExcelJS) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet =
    workbook.worksheets.find((ws) => /product/i.test(ws.name)) ||
    workbook.worksheets[0];
  if (!worksheet) {
    throw Object.assign(new Error("Excel file has no sheets"), {
      code: "BULK_BAD_SHEET",
    });
  }

  const headerRow = worksheet.getRow(1);
  const colByHeader = {};
  const imageColToSlot = {}; // 1-based excel col -> gallery slot 1..8

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const header = normalizeBulkHeader(cell.value);
    if (!header) return;
    colByHeader[header] = colNumber;
    const imgMatch = /^Image_([1-8])$/i.exec(header);
    if (imgMatch) {
      imageColToSlot[colNumber] = Number(imgMatch[1]);
    }
  });

  if (!colByHeader["Item No#"] || !colByHeader["Product Name (EN)"]) {
    throw Object.assign(
      new Error(
        "Excel must include columns: Item No#, Product Name (EN), Original Price, Discount Price, Stock, Image_1…Image_8"
      ),
      { code: "BULK_BAD_HEADERS" }
    );
  }

  /** excelRow (1-based) -> { slot -> Buffer } */
  const imagesByRow = new Map();

  const sheetImages =
    typeof worksheet.getImages === "function" ? worksheet.getImages() : [];

  for (const meta of sheetImages) {
    try {
      const range = meta.range || {};
      const tl = range.tl || {};
      // ExcelJS: nativeRow/nativeCol are 0-based; row/col may be floats
      const nativeRow =
        tl.nativeRow != null
          ? Number(tl.nativeRow)
          : tl.row != null
            ? Math.floor(Number(tl.row))
            : null;
      const nativeCol =
        tl.nativeCol != null
          ? Number(tl.nativeCol)
          : tl.col != null
            ? Math.floor(Number(tl.col))
            : null;
      if (nativeRow == null || nativeCol == null || Number.isNaN(nativeRow)) {
        continue;
      }
      const excelRow = nativeRow + 1; // convert to 1-based sheet row
      const excelCol = nativeCol + 1;
      if (excelRow < 2) continue; // skip header row images

      let slot = imageColToSlot[excelCol];
      if (!slot) {
        // Picture slightly off-column: snap to nearest Image_* column
        const imgCols = Object.keys(imageColToSlot).map(Number);
        if (!imgCols.length) continue;
        let best = imgCols[0];
        let bestDist = Math.abs(excelCol - best);
        for (const c of imgCols) {
          const d = Math.abs(excelCol - c);
          if (d < bestDist) {
            best = c;
            bestDist = d;
          }
        }
        if (bestDist > 1) continue;
        slot = imageColToSlot[best];
      }

      const image = workbook.getImage(meta.imageId);
      if (!image?.buffer || !image.buffer.length) continue;

      if (!imagesByRow.has(excelRow)) imagesByRow.set(excelRow, {});
      const rowImgs = imagesByRow.get(excelRow);
      // Keep first image for a slot; ignore extras in same cell
      if (!rowImgs[slot]) {
        rowImgs[slot] = Buffer.from(image.buffer);
      }
    } catch (imgErr) {
      console.error("bulk image extract", imgErr);
    }
  }

  const rows = [];
  const lastRow = worksheet.actualRowCount || worksheet.rowCount || 0;
  for (let r = 2; r <= lastRow; r += 1) {
    const row = worksheet.getRow(r);
    const get = (header) => {
      const col = colByHeader[header];
      if (!col) return "";
      return cellText(row.getCell(col).value);
    };
    const getNum = (header) => {
      const col = colByHeader[header];
      if (!col) return null;
      return cellNumber(row.getCell(col).value);
    };

    const itemNo = get("Item No#");
    const titleEn = get("Product Name (EN)");
    if (!itemNo && !titleEn) continue;

    const embedded = imagesByRow.get(r) || {};
    const imageBuffers = [];
    for (let slot = 1; slot <= MAX_PRODUCT_IMAGES; slot += 1) {
      if (embedded[slot]) {
        imageBuffers.push({ slot, buffer: embedded[slot] });
      }
    }

    rows.push({
      excelRow: r,
      item_no: itemNo,
      title_en: titleEn,
      title_ar: get("Product Name (AR)"),
      desc_en: get("Description (EN)"),
      desc_ar: get("Description (AR)"),
      material: get("Material"),
      dimension: get("Dimension"),
      original_price: getNum("Original Price"),
      discount_price: getNum("Discount Price"),
      stock: getNum("Stock"),
      imageBuffers,
    });
  }

  return rows;
}

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
    item_no: String(body.item_no || "").trim(),
    deal_title: title,
    deal_title_french: String(body.deal_title_french || title),
    url_title: String(body.url_title || slugify(title)),
    deal_key,
    deal_description: String(body.deal_description || ""),
    deal_description_french: String(body.deal_description_french || ""),
    material: String(body.material || ""),
    dimension: String(body.dimension || ""),
    brand_id: Number(body.brand_id) || 1,
    terms_conditions: String(body.terms_conditions || ""),
    meta_description: String(body.meta_description || ""),
    meta_keywords: String(body.meta_keywords || ""),
    meta_description_french: String(body.meta_description_french || ""),
    meta_keywords_french: String(body.meta_keywords_french || ""),
    category_ids: String(body.category_ids || body.category_id || ""),
    category_id: Number(body.category_id) || 0,
    sub_category_id: 0,
    sec_category_id: 0,
    third_category_id: 0,
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
    brand_names: String(body.brand_names || "GOZO HOME"),
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
  // sub_products.price = MRP (deal_value); sub_products.discount = sale (deal_price)
  const price =
    body.price !== undefined ? Number(body.price) : Number(product.deal_value) || 0;
  const discount =
    body.discount !== undefined
      ? Number(body.discount)
      : Number(product.deal_price) || price;

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
            { item_no: rx },
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
    const rawId = String(req.params.dealId || "").trim();
    if (!/^\d+$/.test(rawId)) {
      return res.send(fail("Invalid product id"));
    }
    const dealId = parseInt(rawId, 10);
    if (!Number.isFinite(dealId) || dealId <= 0) {
      return res.send(fail("Invalid product id"));
    }
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
    const itemNo = String(body.item_no || "").trim();
    if (itemNo) {
      const existingItem = await findOne("product", { item_no: itemNo });
      if (existingItem) {
        return res.send(fail(`Item No# "${itemNo}" already exists`));
      }
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

    if (body.item_no !== undefined) {
      body.item_no = String(body.item_no || "").trim();
      if (body.item_no) {
        const dup = await findOne("product", {
          item_no: body.item_no,
          deal_id: { $ne: dealId },
        });
        if (dup) {
          return res.send(fail(`Item No# "${body.item_no}" already exists`));
        }
      }
    }
    if (body.material !== undefined) {
      body.material = String(body.material || "");
    }
    if (body.dimension !== undefined) {
      body.dimension = String(body.dimension || "");
    }

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
        price: product.deal_value,
        discount: product.deal_price,
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

/**
 * Download Excel template — Image_1…Image_8 columns for inserting pictures
 * (same idea as Add product gallery: Image 1 = main, … Image 8).
 */
exports.downloadBulkTemplate = async (_req, res) => {
  try {
    const { ExcelJS } = requireBulkLibs();
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Products");

    ws.columns = BULK_COLUMNS.map((header) => ({
      header,
      key: header,
      width: /^Image_/i.test(header) ? 18 : Math.max(14, header.length + 2),
    }));

    const sample = {
      "Item No#": "GOZO-001",
      "Product Name (EN)": "Ceramic Storage Jar",
      "Product Name (AR)": "برطمان تخزين سيراميك",
      "Description (EN)": "Handcrafted ceramic jar for kitchen storage",
      "Description (AR)": "برطمان سيراميك مصنوع يدوياً للتخزين",
      Material: "Ceramic",
      Dimension: "15 x 10 cm",
      "Original Price": 12.5,
      "Discount Price": 9.9,
      Stock: 25,
      Image_1: "← Insert main photo here",
      Image_2: "← Insert photo 2",
      Image_3: "",
      Image_4: "",
      Image_5: "",
      Image_6: "",
      Image_7: "",
      Image_8: "",
    };
    ws.addRow(sample);
    ws.getRow(1).font = { bold: true };
    ws.getRow(2).height = 80;
    for (let c = 1; c <= BULK_COLUMNS.length; c += 1) {
      if (/^Image_/i.test(BULK_COLUMNS[c - 1])) {
        ws.getRow(2).getCell(c).alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
      }
    }

    const guide = workbook.addWorksheet("Instructions");
    const lines = [
      ["GOZO HOME — Product bulk upload format"],
      [""],
      ["1. Select a Category in Admin → Products → Bulk upload, then upload this file."],
      ["2. One product per row (about 100 products max)."],
      ["3. Required text: Item No#, Product Name (EN), Original Price, Discount Price, Stock."],
      ["4. Fill Product Name (AR) and Description (AR) for Arabic customers."],
      ["5. IMAGES: do NOT paste links. Insert pictures into Image_1 … Image_8 on that product’s row."],
      ["6. How: click the Image_1 cell → Insert → Image (or Picture) → place it in that column."],
      ["7. Image_1 = main photo, Image_2 … Image_8 = gallery (same as Add product). Min 1, max 8."],
      ["8. That is how each photo is linked to the correct product — same row as the Item No#."],
      ["9. Item No# must be unique. If it is already in Products, that row is skipped."],
      ["10. Optional: you may also add a ZIP with GOZO-001_1.jpg naming as a backup."],
    ];
    lines.forEach((line) => guide.addRow(line));
    guide.getColumn(1).width = 100;

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="gozo-product-bulk-template.xlsx"'
    );
    return res.send(buffer);
  } catch (err) {
    console.error(err);
    return res.send(
      fail(
        err?.code === "BULK_DEPS_MISSING"
          ? err.message
          : err.message || "Failed to generate template"
      )
    );
  }
};

/**
 * Bulk import: Excel text + pictures inserted in Image_1…Image_8 (per row).
 * Optional ZIP fallback: {ItemNo}_1.jpg … {ItemNo}_8.png
 * Skips rows whose Item No# already exists.
 */
exports.bulkUploadProducts = async (req, res) => {
  try {
    const { ExcelJS, AdmZip } = requireBulkLibs();
    const category_id = Number(req.body?.category_id || req.query?.category_id);
    if (!category_id) {
      return res.send(fail("category_id is required — select a Category first"));
    }

    const category = await findOne("category", { category_id });
    if (!category) {
      return res.send(fail("Category not found"));
    }

    const excelFile =
      (req.files?.excel && req.files.excel[0]) ||
      (req.file?.fieldname === "excel" ? req.file : null);
    if (!excelFile?.buffer) {
      return res.send(fail("Excel file is required (field name: excel)"));
    }

    let rows;
    try {
      rows = await parseBulkExcel(excelFile.buffer, ExcelJS);
    } catch (parseErr) {
      console.error(parseErr);
      return res.send(fail(parseErr.message || "Invalid Excel file"));
    }

    if (!rows.length) {
      return res.send(fail("Excel sheet is empty"));
    }
    if (rows.length > 120) {
      return res.send(fail("Too many rows — upload max 100 products per file"));
    }

    const zipFile = req.files?.images_zip && req.files.images_zip[0];
    const zipIndex = buildZipImageIndex(zipFile?.buffer, AdmZip);

    const created = [];
    const skipped = [];
    const errors = [];
    const seenInFile = new Set();

    for (const row of rows) {
      const excelRow = row.excelRow;
      const itemNo = row.item_no;
      const titleEn = row.title_en;
      const titleAr = row.title_ar;
      const descEn = row.desc_en;
      const descAr = row.desc_ar;
      const material = row.material;
      const dimension = row.dimension;
      const originalPrice = row.original_price;
      const discountPrice = row.discount_price;
      const stock = row.stock;

      if (!itemNo) {
        errors.push({ row: excelRow, item_no: "", message: "Item No# is required" });
        continue;
      }
      if (!titleEn) {
        errors.push({
          row: excelRow,
          item_no: itemNo,
          message: "Product Name (EN) is required",
        });
        continue;
      }
      if (originalPrice == null || originalPrice < 0) {
        errors.push({
          row: excelRow,
          item_no: itemNo,
          message: "Original Price is required",
        });
        continue;
      }
      if (discountPrice == null || discountPrice < 0) {
        errors.push({
          row: excelRow,
          item_no: itemNo,
          message: "Discount Price is required",
        });
        continue;
      }
      if (stock == null || stock < 0) {
        errors.push({
          row: excelRow,
          item_no: itemNo,
          message: "Stock is required",
        });
        continue;
      }

      const itemKey = itemNo.toLowerCase();
      if (seenInFile.has(itemKey)) {
        skipped.push({
          row: excelRow,
          item_no: itemNo,
          reason: "Same Item No# appears twice in this file",
        });
        continue;
      }
      seenInFile.add(itemKey);

      const existing = await findOne("product", { item_no: itemNo });
      if (existing) {
        skipped.push({
          row: excelRow,
          item_no: itemNo,
          reason: "Already in Products — skipped",
          deal_id: existing.deal_id,
        });
        continue;
      }

      // Prefer pictures inserted in this row’s Image_1…Image_8 columns
      const imageMap = new Map();
      for (const img of row.imageBuffers || []) {
        imageMap.set(img.slot, img.buffer);
      }
      // Optional ZIP fills any missing slots
      for (let slot = 1; slot <= MAX_PRODUCT_IMAGES; slot += 1) {
        if (imageMap.has(slot)) continue;
        const fromZip = zipIndex.get(`${itemKey}_${slot}`);
        if (fromZip?.length) imageMap.set(slot, fromZip);
      }

      const imageBuffers = [];
      for (let slot = 1; slot <= MAX_PRODUCT_IMAGES; slot += 1) {
        const buf = imageMap.get(slot);
        if (buf?.length) imageBuffers.push({ slot, buffer: buf });
      }

      if (imageBuffers.length < 1) {
        errors.push({
          row: excelRow,
          item_no: itemNo,
          message:
            "Add at least 1 picture in Image_1 on this row (Insert → Image). Same as Add product gallery.",
        });
        continue;
      }

      try {
        const payload = productDefaults({
          item_no: itemNo,
          deal_title: titleEn,
          deal_title_french: titleAr || titleEn,
          deal_description: descEn,
          deal_description_french: descAr,
          material,
          dimension,
          deal_value: originalPrice,
          deal_price: discountPrice,
          user_limit_quantity: stock,
          category_id,
          category_ids: String(category_id),
          deal_status: 1,
        });

        const product = await create("product", payload);
        for (const img of imageBuffers.slice(0, MAX_PRODUCT_IMAGES)) {
          await saveProductImage(product.deal_key, img.buffer, img.slot);
        }
        await syncSubProduct(product.deal_id, product, {
          quantity: stock,
          price: originalPrice,
          discount: discountPrice,
          product_image: `${product.deal_key}_1.png`,
          sku: itemNo,
        });

        created.push({
          row: excelRow,
          item_no: itemNo,
          deal_id: product.deal_id,
          deal_title: product.deal_title,
          images: imageBuffers.length,
        });
      } catch (createErr) {
        console.error("bulk row error", createErr);
        const msg =
          createErr?.code === 11000
            ? "already exists"
            : createErr.message || "Failed to create product";
        if (/already exists|duplicate/i.test(msg)) {
          skipped.push({
            row: excelRow,
            item_no: itemNo,
            reason: "Already in Products — skipped",
          });
        } else {
          errors.push({ row: excelRow, item_no: itemNo, message: msg });
        }
      }
    }

    return res.send(
      ok(
        {
          category_id,
          category_name: category.category_name || category.category_name_french || "",
          total_rows: rows.length,
          created_count: created.length,
          skipped_count: skipped.length,
          error_count: errors.length,
          created,
          skipped,
          errors,
        },
        created.length
          ? `Added ${created.length} product(s). Already in Products: ${skipped.length}. Need fix: ${errors.length}`
          : `No new products added. Already in Products: ${skipped.length}. Need fix: ${errors.length}`
      )
    );
  } catch (err) {
    console.error(err);
    return res.send(failFromError(err, "Bulk upload failed"));
  }
};
