const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "../../../..");
const CLOUD = path.join(ROOT, "cloud", "uploads");

const PRODUCT_SIZES = [
  { folder: "1000_800", width: 1000, height: 800 },
  { folder: "160_180", width: 160, height: 180 },
  { folder: "80_80", width: 80, height: 80 },
];

/** Max gallery images per product (Amazon-style PDP). */
const MAX_PRODUCT_IMAGES = 8;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function normalizeImageIndex(index) {
  const n = Number(index);
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_PRODUCT_IMAGES, Math.max(1, Math.floor(n)));
}

/**
 * List which image slots exist on disk for a deal_key (1..MAX).
 */
function listProductImageIndexes(dealKey, max = MAX_PRODUCT_IMAGES) {
  const key = String(dealKey || "").trim();
  if (!key) return [];
  const dir = path.join(CLOUD, "products", "1000_800");
  const indexes = [];
  for (let i = 1; i <= max; i += 1) {
    if (fs.existsSync(path.join(dir, `${key}_${i}.png`))) {
      indexes.push(i);
    }
  }
  return indexes;
}

/**
 * Save product image as {deal_key}_{index}.png into all size folders.
 * @param {string} dealKey
 * @param {Buffer} buffer
 * @param {number} [index=1]
 */
async function saveProductImage(dealKey, buffer, index = 1) {
  const key = String(dealKey || "").trim();
  if (!key) {
    throw new Error("deal_key is required");
  }
  if (!buffer || !buffer.length) {
    throw new Error("Image file is required");
  }

  const slot = normalizeImageIndex(index);
  const filename = `${key}_${slot}.png`;
  const paths = [];

  for (const size of PRODUCT_SIZES) {
    const dir = path.join(CLOUD, "products", size.folder);
    ensureDir(dir);
    const dest = path.join(dir, filename);
    await sharp(buffer)
      .rotate()
      .resize(size.width, size.height, {
        fit: "cover",
        position: "centre",
      })
      .png({ quality: 90 })
      .toFile(dest);
    paths.push(`cloud/uploads/products/${size.folder}/${filename}`);
  }

  return {
    filename,
    index: slot,
    paths,
    relativeUrl: `cloud/uploads/products/1000_800/${filename}`,
  };
}

/**
 * Save banner image as {banner_id}.png
 * (matches storefront BANNER_IMAGE_URL path).
 */
async function saveBannerImage(bannerId, buffer) {
  const id = Number(bannerId);
  if (!id) {
    throw new Error("banner_id is required");
  }
  if (!buffer || !buffer.length) {
    throw new Error("Image file is required");
  }

  const dir = path.join(CLOUD, "banner_images");
  ensureDir(dir);
  const filename = `${id}.png`;
  const dest = path.join(dir, filename);

  await sharp(buffer)
    .rotate()
    .resize(1920, 720, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({ quality: 90 })
    .toFile(dest);

  return {
    filename,
    relativeUrl: `cloud/uploads/banner_images/${filename}`,
  };
}

module.exports = {
  saveProductImage,
  saveBannerImage,
  listProductImageIndexes,
  normalizeImageIndex,
  PRODUCT_SIZES,
  MAX_PRODUCT_IMAGES,
};
