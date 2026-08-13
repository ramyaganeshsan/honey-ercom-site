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

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Save product image as {deal_key}_1.png into all size folders
 * (matches storefront PRODUCT_DISPLAY_IMAGE paths).
 */
async function saveProductImage(dealKey, buffer) {
  const key = String(dealKey || "").trim();
  if (!key) {
    throw new Error("deal_key is required");
  }
  if (!buffer || !buffer.length) {
    throw new Error("Image file is required");
  }

  const filename = `${key}_1.png`;
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
  PRODUCT_SIZES,
};
