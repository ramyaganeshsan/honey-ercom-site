/**
 * Populate cloud/uploads for products + banners already in MongoDB.
 * Does NOT wipe data — safe for staging when images 404 after deploy
 * (cloud/ is gitignored and never shipped with git).
 *
 * Usage (on the API server):
 *   npm run seed:images
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { connectMongo, disconnectMongo } = require("./connection");
const models = require("./models");
const { Counter } = require("./counters");

const ROOT = path.resolve(__dirname, "../../..");
const ASSETS = path.join(ROOT, "assets");
const CLOUD = path.join(ROOT, "cloud", "uploads");
const UI_PUBLIC = path.resolve(
  ROOT,
  "../original_HoneyEcommerce_new_ui/public/images"
);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

function firstExisting(paths) {
  return paths.find((p) => fs.existsSync(p) && fs.statSync(p).size > 0);
}

async function main() {
  await connectMongo();

  // Ensure GOZO brand home banners exist (guideline images 5/6/7)
  const brandBanners = [
    {
      banner_id: 1,
      image_title: "GOZO HOME Storefront",
      image_title_french: "واجهة غوزو هوم",
      image_info: "THE JOY OF DECORS CRAFTED",
      image_info_french: "",
      redirect_url: "/products",
      position: 1,
      product: 0,
      home: 1,
      status: 1,
    },
    {
      banner_id: 2,
      image_title: "Crafted Packaging",
      image_title_french: "تغليف مصنوع بعناية",
      image_info: "Black & white brand packaging",
      image_info_french: "",
      redirect_url: "/products",
      position: 2,
      product: 0,
      home: 1,
      status: 1,
    },
    {
      banner_id: 3,
      image_title: "Lifestyle Bag",
      image_title_french: "حقيبة نمط الحياة",
      image_info: "GOZO HOME",
      image_info_french: "",
      redirect_url: "/products",
      position: 3,
      product: 0,
      home: 1,
      status: 1,
    },
  ];

  for (const b of brandBanners) {
    await models.banner_image.updateOne(
      { banner_id: b.banner_id },
      { $set: b },
      { upsert: true }
    );
  }
  await Counter.findOneAndUpdate(
    { _id: "banner_image" },
    { $max: { seq: 3 } },
    { upsert: true }
  );

  const [products, banners] = await Promise.all([
    models.product.find({}).select("deal_id deal_key deal_title").lean(),
    models.banner_image.find({}).select("banner_id").lean(),
  ]);

  const bannerDir = path.join(CLOUD, "banner_images");
  const productDirs = [
    path.join(CLOUD, "products", "1000_800"),
    path.join(CLOUD, "products", "160_180"),
    path.join(CLOUD, "products", "80_80"),
  ];
  const logoDir = path.join(CLOUD, "logo");
  ensureDir(bannerDir);
  ensureDir(logoDir);
  productDirs.forEach(ensureDir);

  let bannersWritten = 0;
  for (const b of banners) {
    const src = firstExisting([
      path.join(ASSETS, "images", `banner-${b.banner_id}.png`),
      path.join(UI_PUBLIC, `banner-${b.banner_id}.png`),
      path.join(ASSETS, "images", "gozo", "banner-storefront.png"),
      path.join(ASSETS, "images", "banner-1.png"),
      path.join(ASSETS, "images", "poster.png"),
      path.join(ASSETS, "images", "img-500.png"),
    ]);
    if (src && copyIfExists(src, path.join(bannerDir, `${b.banner_id}.png`))) {
      bannersWritten += 1;
    }
  }

  const dummyProducts = [
    path.join(ASSETS, "images", "dummy-product-1.png"),
    path.join(ASSETS, "images", "dummy-product-2.png"),
    path.join(ASSETS, "images", "dummy-product-3.png"),
    path.join(ASSETS, "images", "dummy-product-4.png"),
    path.join(UI_PUBLIC, "dummy-product-1.png"),
    path.join(UI_PUBLIC, "dummy-product-2.png"),
    path.join(UI_PUBLIC, "dummy-product-3.png"),
    path.join(UI_PUBLIC, "dummy-product-4.png"),
  ].filter((p) => fs.existsSync(p) && fs.statSync(p).size > 0);

  // Prefer assets/ copies (unique list by basename order)
  const uniqueDummies = [];
  const seen = new Set();
  for (const p of dummyProducts) {
    const base = path.basename(p);
    if (seen.has(base)) continue;
    seen.add(base);
    uniqueDummies.push(p);
  }

  let productsWritten = 0;
  let skipped = 0;
  products.forEach((p, idx) => {
    const key = String(p.deal_key || "").trim();
    if (!key) {
      skipped += 1;
      return;
    }
    const destName = `${key}_1.png`;
    const already = productDirs.every((dir) =>
      fs.existsSync(path.join(dir, destName))
    );
    if (already) return;

    const src = uniqueDummies[idx % Math.max(uniqueDummies.length, 1)];
    if (!src) {
      skipped += 1;
      return;
    }
    for (const dir of productDirs) {
      copyIfExists(src, path.join(dir, destName));
    }
    productsWritten += 1;
  });

  const logoPng = firstExisting([
    path.join(ASSETS, "images", "gozo", "logo-mark-en-black.png"),
    path.join(ASSETS, "images", "gozo", "brand-mark.png"),
    path.join(ASSETS, "images", "gozo", "logo-en-black.png"),
    path.join(ASSETS, "images", "logo.png"),
    path.join(UI_PUBLIC, "logo.png"),
    path.join(ASSETS, "images", "dummy-product-1.png"),
    path.join(UI_PUBLIC, "dummy-product-1.png"),
  ]);
  if (logoPng) copyIfExists(logoPng, path.join(logoDir, "logo.png"));
  copyIfExists(
    path.join(ASSETS, "images", "logo.svg"),
    path.join(logoDir, "logo.svg")
  );
  // Footer / white mark for cloud
  copyIfExists(
    path.join(ASSETS, "images", "gozo", "logo-mark-en-white.png"),
    path.join(logoDir, "footer-logo.png")
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        cloud: CLOUD,
        banners: { inDb: banners.length, written: bannersWritten },
        products: {
          inDb: products.length,
          written: productsWritten,
          skipped,
        },
        tip: "Verify: curl -I https://YOUR-API/cloud/uploads/banner_images/1.png",
      },
      null,
      2
    )
  );

  await disconnectMongo();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
