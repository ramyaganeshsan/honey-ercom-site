/**
 * Seed a demo honey catalog for local development.
 * Usage: npm run seed:demo
 *
 * Preserves numeric IDs the UI expects. Copies placeholder images into
 * cloud/uploads so banner/product URLs resolve under DASHBOARD_URL.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const md5 = require("md5");
const { connectMongo, disconnectMongo } = require("./connection");
const { Counter } = require("./counters");
const models = require("./models");

const ROOT = path.resolve(__dirname, "../../..");
const ASSETS = path.join(ROOT, "assets");
const CLOUD = path.join(ROOT, "cloud", "uploads");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyIfExists(src, dest) {
  if (!fs.existsSync(src)) return false;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return true;
}

function setupImages(products, banners) {
  const bannerDir = path.join(CLOUD, "banner_images");
  const productDirs = [
    path.join(CLOUD, "products", "1000_800"),
    path.join(CLOUD, "products", "160_180"),
    path.join(CLOUD, "products", "80_80"),
  ];
  ensureDir(bannerDir);
  productDirs.forEach(ensureDir);

  const bannerSrc =
    path.join(ASSETS, "images", "banner-1.png") ||
    path.join(ASSETS, "images", "poster.png");
  const uiPublic = path.resolve(ROOT, "../original_HoneyEcommerce_new_ui/public/images");

  for (const b of banners) {
    const candidates = [
      path.join(uiPublic, `banner-${b.banner_id}.png`),
      path.join(ASSETS, "images", "poster.png"),
      path.join(ASSETS, "images", "img-500.png"),
    ];
    const src = candidates.find((p) => fs.existsSync(p));
    if (src) {
      copyIfExists(src, path.join(bannerDir, `${b.banner_id}.png`));
    }
  }

  const dummyProducts = [
    path.join(ASSETS, "images", "dummy-product-1.png"),
    path.join(ASSETS, "images", "dummy-product-2.png"),
    path.join(ASSETS, "images", "dummy-product-3.png"),
  ];

  products.forEach((p, idx) => {
    const src = dummyProducts[idx % dummyProducts.length];
    for (const dir of productDirs) {
      copyIfExists(src, path.join(dir, `${p.deal_key}_1.png`));
    }
  });
}

async function wipeDemoCollections() {
  const names = [
    "settings",
    "banner_image",
    "category",
    "product",
    "sub_products",
    "country",
    "state",
    "city",
    "cms",
    "users",
    "sessions",
    "notification_template",
    "email_settings",
    "counters",
  ];
  for (const name of names) {
    if (models[name]) {
      await models[name].deleteMany({});
    }
  }
  await Counter.deleteMany({});
}

/**
 * MongoDB Compass only lists collections that exist.
 * Create every mapped collection (even empty) so all ~73 tables appear.
 */
async function ensureAllCollections() {
  const { mongoose } = require("./connection");
  const db = mongoose.connection.db;
  const existing = new Set(
    (await db.listCollections().toArray()).map((c) => c.name)
  );

  const collectionNames = new Set();
  for (const model of Object.values(models)) {
    if (model?.collection?.name) {
      collectionNames.add(model.collection.name);
    }
  }
  collectionNames.add("counters");

  let created = 0;
  for (const name of collectionNames) {
    if (!existing.has(name)) {
      await db.createCollection(name);
      created += 1;
    }
  }
  console.log(
    `Collections ready: ${collectionNames.size} total (${created} newly created)`
  );
}

async function seed() {
  await connectMongo();
  console.log("Connected to MongoDB");

  await ensureAllCollections();
  await wipeDemoCollections();

  const now = Math.floor(Date.now() / 1000);

  await models.settings.collection.insertOne({
    id: 1,
    site_name: "Manahel Althunayyan",
    site_name_french: "مناحل الثنيان",
    title: "Thunayyan Honey UAE",
    title_french: "عسل الثنيان",
    default_language: "english",
    contact_email: "info@thunayanhoneyuae.com",
    webmaster_email: "info@thunayanhoneyuae.com",
    noreply_email: "noreply@thunayanhoneyuae.com",
    phone1: "+971 555540017",
    phone2: "",
    address1: "Muwaileh Commercial",
    address2: "Industrial Area, Sharjah - UAE",
    zipcode: "00000",
    country: 254,
    city: 132,
    facebook_page: "",
    instagram_page: "",
    twitter_page: "",
    linkedin_page: "",
    android_page: "",
    iphone_page: "",
    youtube_url: "",
    currency_symbol: "AED",
    currency_code: "AED",
    time_zone: "Asia/Dubai",
    tax_percentage: 5,
    pagination_count: 12,
    latitude: "25.3101091",
    longitude: "55.4595754",
    minimumProductQuantityToNotify: 5,
    adminEmailAddress: "info@thunayanhoneyuae.com",
    sendOutOfStockNotification: 0,
    hesabe_merchant_code: "",
    hesabe_payment_mode: 0,
    hesabe_payment_description: "",
    hesabe_payment_description_arabic: "",
    payment_description_arabic: "",
    meta_keywords: "honey,uae",
    meta_description: "Premium honey UAE",
    theme: "default",
    contact_name: "Support",
    skype_id: "",
    facebook_fanpage: "",
    analytics_code: "",
  });

  const banners = [
    {
      banner_id: 1,
      image_title: "Natural Honey",
      image_title_french: "عسل طبيعي",
      image_info: "Farm fresh",
      image_info_french: "",
      redirect_url: "/products",
      position: 1,
      product: 0,
      home: 1,
      status: 1,
    },
    {
      banner_id: 2,
      image_title: "Sidr Honey",
      image_title_french: "عسل سدر",
      image_info: "Premium",
      image_info_french: "",
      redirect_url: "/products",
      position: 2,
      product: 0,
      home: 1,
      status: 1,
    },
  ];
  await models.banner_image.collection.insertMany(banners);

  // Category tree: main -> sub -> leaf
  const categories = [
    {
      category_id: 1,
      main_category_id: 0,
      sub_category_id: 0,
      category_name: "Honey",
      category_name_french: "عسل",
      category_description: "Honey products",
      category_description_french: "",
      category_url: "honey",
      category_icon: "",
      category_image: "",
      color_code: "",
      category_mapping: "",
      home_category_order: 1,
      home_category: 1,
      category_status: 1,
      product: 1,
      customize_type: 0,
      type: 0,
      sort_order: 1,
      menu_sort_order: 1,
      category_list_title: "Honey",
      category_list_description: "",
      category_list_image: "",
      discount_type: 0,
      discount_value: 0,
    },
    {
      category_id: 2,
      main_category_id: 1,
      sub_category_id: 1,
      category_name: "Natural Honey",
      category_name_french: "عسل طبيعي",
      category_description: "",
      category_description_french: "",
      category_url: "natural-honey",
      category_icon: "",
      category_image: "",
      color_code: "",
      category_mapping: "",
      home_category_order: 1,
      home_category: 1,
      category_status: 1,
      product: 1,
      customize_type: 0,
      type: 0,
      sort_order: 1,
      menu_sort_order: 1,
      category_list_title: "Natural Honey",
      category_list_description: "",
      category_list_image: "",
      discount_type: 0,
      discount_value: 0,
    },
    {
      category_id: 3,
      main_category_id: 1,
      sub_category_id: 2,
      category_name: "Sidr",
      category_name_french: "سدر",
      category_description: "",
      category_description_french: "",
      category_url: "sidr",
      category_icon: "",
      category_image: "",
      color_code: "",
      category_mapping: "",
      home_category_order: 2,
      home_category: 1,
      category_status: 1,
      product: 1,
      customize_type: 0,
      type: 0,
      sort_order: 2,
      menu_sort_order: 2,
      category_list_title: "Sidr",
      category_list_description: "",
      category_list_image: "",
      discount_type: 0,
      discount_value: 0,
    },
    {
      category_id: 720,
      main_category_id: 0,
      sub_category_id: 0,
      category_name: "Offers",
      category_name_french: "عروض",
      category_description: "Offer products",
      category_description_french: "",
      category_url: "offers",
      category_icon: "",
      category_image: "",
      color_code: "",
      category_mapping: "",
      home_category_order: 99,
      home_category: 0,
      category_status: 1,
      product: 1,
      customize_type: 0,
      type: 0,
      sort_order: 99,
      menu_sort_order: 99,
      category_list_title: "Offers",
      category_list_description: "",
      category_list_image: "",
      discount_type: 0,
      discount_value: 0,
    },
  ];
  await models.category.collection.insertMany(categories);

  const products = [
    {
      deal_id: 101,
      deal_title: "Yemeni Sidr Honey 500g",
      deal_title_french: "عسل سدر يمني 500غ",
      url_title: "yemeni-sidr-honey-500g",
      deal_key: "yemeni-sidr-500",
      deal_description: "Premium Yemeni Sidr honey.",
      deal_description_french: "",
      brand_id: 1,
      terms_conditions: "",
      meta_description: "",
      meta_keywords: "",
      meta_description_french: "",
      meta_keywords_french: "",
      category_ids: "1,2,3",
      category_id: 3,
      sub_category_id: 2,
      sec_category_id: 0,
      third_category_id: 0,
      deal_type: 1,
      deal_value: 180,
      deal_price: 150,
      deal_savings: 30,
      shop_id: 1,
      deal_percentage: 16,
      purchase_count: 42,
      user_limit_quantity: 50,
      created_date: now,
      created_by: 1,
      deal_status: 1,
      delivery_period: "2-3 days",
      view_count: 100,
      attribute: 0,
      deal_feature: 1,
      combo_products: "",
      combo_price: "",
      tags: "honey,sidr",
      cat_tags: "",
      related_products: "102,103",
      is_customized: 0,
      having_size_color: 0,
      merchant_id: 1,
      shipping: 0,
      brand_names: "Thunayyan",
      supplier_names: "",
      supplier_id: 0,
      ballon_filling_option: "",
    },
    {
      deal_id: 102,
      deal_title: "Wildflower Honey 1kg",
      deal_title_french: "عسل زهور برية 1كغ",
      url_title: "wildflower-honey-1kg",
      deal_key: "wildflower-1kg",
      deal_description: "Pure wildflower honey.",
      deal_description_french: "",
      brand_id: 1,
      terms_conditions: "",
      meta_description: "",
      meta_keywords: "",
      meta_description_french: "",
      meta_keywords_french: "",
      category_ids: "1,2",
      category_id: 2,
      sub_category_id: 2,
      sec_category_id: 0,
      third_category_id: 0,
      deal_type: 1,
      deal_value: 120,
      deal_price: 95,
      deal_savings: 25,
      shop_id: 1,
      deal_percentage: 20,
      purchase_count: 88,
      user_limit_quantity: 80,
      created_date: now,
      created_by: 1,
      deal_status: 1,
      delivery_period: "2-3 days",
      view_count: 200,
      attribute: 0,
      deal_feature: 1,
      combo_products: "",
      combo_price: "",
      tags: "honey,wildflower",
      cat_tags: "",
      related_products: "101,103",
      is_customized: 0,
      having_size_color: 0,
      merchant_id: 1,
      shipping: 0,
      brand_names: "Thunayyan",
      supplier_names: "",
      supplier_id: 0,
      ballon_filling_option: "",
    },
    {
      deal_id: 103,
      deal_title: "Acacia Honey 250g",
      deal_title_french: "عسل أكاسيا 250غ",
      url_title: "acacia-honey-250g",
      deal_key: "acacia-250",
      deal_description: "Light acacia honey.",
      deal_description_french: "",
      brand_id: 1,
      terms_conditions: "",
      meta_description: "",
      meta_keywords: "",
      meta_description_french: "",
      meta_keywords_french: "",
      category_ids: "1,2",
      category_id: 2,
      sub_category_id: 2,
      sec_category_id: 0,
      third_category_id: 0,
      deal_type: 1,
      deal_value: 70,
      deal_price: 55,
      deal_savings: 15,
      shop_id: 1,
      deal_percentage: 21,
      purchase_count: 30,
      user_limit_quantity: 100,
      created_date: now,
      created_by: 1,
      deal_status: 1,
      delivery_period: "2-3 days",
      view_count: 50,
      attribute: 0,
      deal_feature: 0,
      combo_products: "",
      combo_price: "",
      tags: "honey,acacia",
      cat_tags: "",
      related_products: "101,102",
      is_customized: 0,
      having_size_color: 0,
      merchant_id: 1,
      shipping: 0,
      brand_names: "Thunayyan",
      supplier_names: "",
      supplier_id: 0,
      ballon_filling_option: "",
    },
    {
      deal_id: 104,
      deal_title: "Gift Box Honey Duo",
      deal_title_french: "علبة هدايا عسل",
      url_title: "gift-box-honey-duo",
      deal_key: "gift-duo",
      deal_description: "Special offer gift set.",
      deal_description_french: "",
      brand_id: 1,
      terms_conditions: "",
      meta_description: "",
      meta_keywords: "",
      meta_description_french: "",
      meta_keywords_french: "",
      category_ids: "720",
      category_id: 720,
      sub_category_id: 0,
      sec_category_id: 0,
      third_category_id: 0,
      deal_type: 1,
      deal_value: 250,
      deal_price: 199,
      deal_savings: 51,
      shop_id: 1,
      deal_percentage: 20,
      purchase_count: 15,
      user_limit_quantity: 25,
      created_date: now,
      created_by: 1,
      deal_status: 1,
      delivery_period: "2-3 days",
      view_count: 40,
      attribute: 0,
      deal_feature: 1,
      combo_products: "",
      combo_price: "",
      tags: "offer,gift",
      cat_tags: "",
      related_products: "101,102",
      is_customized: 0,
      having_size_color: 0,
      merchant_id: 1,
      shipping: 0,
      brand_names: "Thunayyan",
      supplier_names: "",
      supplier_id: 0,
      ballon_filling_option: "",
    },
  ];
  await models.product.collection.insertMany(products);

  const subProducts = products.map((p, i) => ({
    id: i + 1,
    product_id: p.deal_id,
    deal_id: p.deal_id,
    size_id: 0,
    color_id: 0,
    quantity: p.user_limit_quantity,
    price: p.deal_price,
    discount: p.deal_value,
    product_key: p.deal_key,
    product_image: `${p.deal_key}_1.png`,
    sku: `SKU-${p.deal_id}`,
    created_date: now,
    status: 1,
  }));
  await models.sub_products.collection.insertMany(subProducts);

  await models.country.collection.insertOne({
    country_id: 254,
    country_name: "United Arab Emirates",
    country_code: "AE",
    country_status: 1,
    ISO_country_code: "AE",
  });
  await models.state.collection.insertOne({
    state_id: 22,
    state_name: "Sharjah",
    state_name_arabic: "الشارقة",
    state_country_id: 254,
    statestatus: 1,
  });
  await models.city.collection.insertOne({
    city_id: 132,
    country_id: 254,
    stateid: 22,
    city_name: "Muwaileh",
    city_name_french: "مویله",
    delivery_charge: 15,
    city_status: 1,
  });

  await models.cms.collection.insertMany([
    {
      cms_id: 1,
      cms_title: "About Us",
      cms_title_french: "من نحن",
      cms_desc: "<p>Premium honey from Manahel Althunayyan.</p>",
      cms_desc_french: "",
      cms_url: "about-us",
      type: 0,
      cms_status: 1,
    },
    {
      cms_id: 2,
      cms_title: "Privacy Policy",
      cms_title_french: "سياسة الخصوصية",
      cms_desc: "<p>Privacy policy content.</p>",
      cms_desc_french: "",
      cms_url: "privacy-policy",
      type: 0,
      cms_status: 1,
    },
  ]);

  const demoPassword = "Demo@123";
  await models.users.collection.insertOne({
    user_id: 1,
    firstname: "Demo",
    lastname: "User",
    firstname_french: "",
    lastname_french: "",
    email: "demo@thunayanhoney.com",
    password: md5(demoPassword),
    originalPassword: demoPassword,
    phone_number: "971500000000",
    city_id: 132,
    state_id: 22,
    country_id: 254,
    user_type: 4,
    user_status: 1,
    approve_status: 1,
    login_type: 1,
    joined_date: now,
    last_login: now,
    wishlist: "",
    is_guest: 0,
    user_reg_type: 0,
    gender: 1,
    referral_id: "DEMO0001",
    referred_user_id: 0,
    twitter_secret_token: 0,
    ship_country: 254,
    ship_city: 132,
    ship_zipcode: 0,
    flat_amount: 0,
    change_password_must: 0,
    login_count: 0,
    lang: 0,
    facebook_update: 0,
    deal_bought_count: 0,
    created_by: 0,
    user_referral_balance: 0,
    merchant_account_balance: 0,
    merchant_commission: 0,
    fb_user_id: "",
    fb_session_key: "",
    twitter_id: "",
    twitter_access_token: "",
    address1: "Muwaileh Commercial",
    address2: "Industrial Area, Sharjah - UAE",
    dob: "",
    my_favouites: "",
    payment_account_id: "",
    ship_name: "Demo User",
    ship_address1: "Muwaileh Commercial",
    ship_address2: "Industrial Area, Sharjah - UAE",
    ship_state: "Sharjah",
    ship_mobileno: "971500000000",
    AccountCountryCode: "",
    AccountEntity: "",
    AccountNumber: "",
    AccountPin: "",
    UserName: "",
    ShippingPassword: "",
    gplus_id: "",
    gplus_access_token: "",
    about_us: "",
    fbid: "",
    refference_key: String(now),
  });

  await models.email_settings.collection.insertOne({
    settings_id: 1,
    sendgrid_host: "",
    sendgrid_port: 587,
    sendgrid_username: "",
    sendgrid_password: "",
    smtp_host: "smtp.gmail.com",
    smtp_port: 465,
    smtp_type: "ssl",
    // Dummy placeholders — leave blank so local order email is skipped safely
    smtp_username: "",
    smtp_password: "",
    api_key: "",
    list_id: "",
    replay_to_mail: "noreply@thunayanhoneyuae.com",
    from_name: "Thunayyan Honey UAE",
    status: 1,
  });

  await models.notification_template.collection.insertMany([
    {
      id: 20,
      email_from: "noreply@thunayanhoneyuae.com",
      template_index: "order_success",
      send_email: true,
      subject: "Your order ##ORDER_ID## is confirmed",
      subject_ar: "تم تأكيد طلبك ##ORDER_ID##",
      template_content:
        "<p>Thank you for your order.</p><p>Order ID: <strong>##ORDER_ID##</strong></p>",
      template_content_ar:
        "<p>شكراً لطلبك.</p><p>رقم الطلب: <strong>##ORDER_ID##</strong></p>",
    },
    {
      id: 21,
      email_from: "noreply@thunayanhoneyuae.com",
      template_index: "order_cancelled",
      send_email: true,
      subject: "Your order ##ORDER_ID## was cancelled",
      subject_ar: "تم إلغاء طلبك ##ORDER_ID##",
      template_content:
        "<p>Your order <strong>##ORDER_ID##</strong> has been cancelled.</p>",
      template_content_ar:
        "<p>تم إلغاء طلبك <strong>##ORDER_ID##</strong>.</p>",
    },
    {
      id: 22,
      email_from: "noreply@thunayanhoneyuae.com",
      template_index: "order_return",
      send_email: true,
      subject: "Return request for order ##ORDER_ID##",
      subject_ar: "طلب إرجاع للطلب ##ORDER_ID##",
      template_content:
        "<p>We received a return request for order <strong>##ORDER_ID##</strong>.</p>",
      template_content_ar:
        "<p>استلمنا طلب إرجاع للطلب <strong>##ORDER_ID##</strong>.</p>",
    },
    {
      id: 23,
      email_from: "noreply@thunayanhoneyuae.com",
      template_index: "order_placed_admin",
      send_email: true,
      subject: "New order placed ##ORDER_ID##",
      subject_ar: "طلب جديد ##ORDER_ID##",
      template_content:
        "<p>A new order was placed.</p><p>Order ID: <strong>##ORDER_ID##</strong></p>",
      template_content_ar:
        "<p>تم إنشاء طلب جديد.</p><p>رقم الطلب: <strong>##ORDER_ID##</strong></p>",
    },
    {
      id: 24,
      email_from: "noreply@thunayanhoneyuae.com",
      template_index: "contact_us_admin",
      send_email: true,
      subject: "New contact us message from ##NAME##",
      subject_ar: "رسالة تواصل جديدة من ##NAME##",
      template_content:
        "<p>New contact request (##CONTACTID##).</p>##CONTENTTABLE##",
      template_content_ar:
        "<p>طلب تواصل جديد (##CONTACTID##).</p>##CONTENTTABLE##",
    },
  ]);

  await Counter.insertMany([
    { _id: "settings", seq: 1 },
    { _id: "banner_image", seq: 2 },
    { _id: "category", seq: 720 },
    { _id: "product", seq: 104 },
    { _id: "sub_products", seq: subProducts.length },
    { _id: "country", seq: 254 },
    { _id: "state", seq: 22 },
    { _id: "city", seq: 132 },
    { _id: "cms", seq: 2 },
    { _id: "users", seq: 1 },
    { _id: "email_settings", seq: 1 },
    { _id: "notification_template", seq: 24 },
  ]);

  setupImages(products, banners);

  console.log("Demo seed complete.");
  console.log("  Login: demo@thunayanhoney.com / Demo@123");
  console.log(`  Products: ${products.length}, Categories: ${categories.length}`);
  console.log(
    "  Seeded notification_template (20-24) + email_settings placeholders."
  );
  console.log(
    "  Note: all mapped collections now exist in MongoDB; demo data is filled for catalog/auth/geo/cms. Other collections stay empty until used by the app (cart, orders, etc.)."
  );
  await disconnectMongo();
}

seed().catch(async (err) => {
  console.error(err);
  try {
    await disconnectMongo();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});
