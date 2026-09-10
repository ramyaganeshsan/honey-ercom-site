/**
 * Seed a demo GOZO HOME catalog for local development.
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
const { ensureAdminUser, ADMIN_EMAIL, ADMIN_PASSWORD } = require("./ensureAdminUser");

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
  const logoDir = path.join(CLOUD, "logo");
  ensureDir(bannerDir);
  ensureDir(logoDir);
  productDirs.forEach(ensureDir);

  const uiPublic = path.resolve(ROOT, "../original_HoneyEcommerce_new_ui/public/images");

  for (const b of banners) {
    const candidates = [
      path.join(ASSETS, "images", `banner-${b.banner_id}.png`),
      path.join(uiPublic, `banner-${b.banner_id}.png`),
      path.join(ASSETS, "images", "poster.png"),
      path.join(ASSETS, "images", "img-500.png"),
    ];
    const src = candidates.find((p) => fs.existsSync(p) && fs.statSync(p).size > 0);
    if (src) {
      copyIfExists(src, path.join(bannerDir, `${b.banner_id}.png`));
    }
  }

  // Invoice / PDF logo — prefer brand logo.png
  copyIfExists(
    path.join(ASSETS, "images", "logo.svg"),
    path.join(logoDir, "logo.svg")
  );
  const logoPngCandidates = [
    path.join(ASSETS, "images", "gozo", "logo-mark-en-black.png"),
    path.join(ASSETS, "images", "gozo", "brand-mark.png"),
    path.join(ASSETS, "images", "gozo", "logo-en-black.png"),
    path.join(ASSETS, "images", "logo.png"),
    path.join(uiPublic, "logo.png"),
    path.join(ASSETS, "images", "dummy-product-1.png"),
  ];
  const logoPng = logoPngCandidates.find((p) => fs.existsSync(p) && fs.statSync(p).size > 0);
  if (logoPng) copyIfExists(logoPng, path.join(logoDir, "logo.png"));
  copyIfExists(
    path.join(ASSETS, "images", "gozo", "logo-mark-en-white.png"),
    path.join(logoDir, "footer-logo.png")
  );

  const dummyProducts = [
    path.join(ASSETS, "images", "dummy-product-1.png"),
    path.join(ASSETS, "images", "dummy-product-2.png"),
    path.join(ASSETS, "images", "dummy-product-3.png"),
    path.join(ASSETS, "images", "dummy-product-4.png"),
  ].filter((p) => fs.existsSync(p) && fs.statSync(p).size > 0);

  products.forEach((p, idx) => {
    const src = dummyProducts[idx % dummyProducts.length];
    if (!src) return;
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
    site_name: "GOZO HOME",
    site_name_french: "جوزو هوم",
    title: "GOZO HOME",
    title_french: "جوزو هوم",
    default_language: "english",
    contact_email: "info@gozohome.com",
    webmaster_email: "admin@gozohome.com",
    noreply_email: "noreply@gozohome.com",
    phone1: "+965 0000 0000",
    phone2: "",
    address1: "Kuwait",
    address2: "Home Accessories",
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
    currency_symbol: "KWD",
    currency_code: "KWD",
    time_zone: "Asia/Kuwait",
    tax_percentage: 0,
    pagination_count: 12,
    latitude: "29.3759",
    longitude: "47.9774",
    minimumProductQuantityToNotify: 5,
    adminEmailAddress: "admin@gozohome.com",
    sendOutOfStockNotification: 0,
    hesabe_merchant_code: "",
    hesabe_payment_mode: 0,
    hesabe_payment_description: "",
    hesabe_payment_description_arabic: "",
    payment_description_arabic: "",
    meta_keywords: "home accessories,decor,kuwait",
    meta_description: "THE JOY OF DECORS CRAFTED",
    theme: "default",
    contact_name: "Support",
    skype_id: "",
    facebook_fanpage: "",
    analytics_code: "",
  });

  const banners = [
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
  await models.banner_image.collection.insertMany(banners);

  // Category tree: main -> sub -> leaf
  const categories = [
    {
      category_id: 1,
      main_category_id: 0,
      sub_category_id: 0,
      category_name: "Home Accessories",
      category_name_french: "إكسسوارات منزلية",
      category_description: "Modern Kuwaiti home accessories",
      category_description_french: "",
      category_url: "home-accessories",
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
      category_list_title: "Home Accessories",
      category_list_description: "",
      category_list_image: "",
      discount_type: 0,
      discount_value: 0,
    },
    {
      category_id: 2,
      main_category_id: 1,
      sub_category_id: 1,
      category_name: "Decor",
      category_name_french: "ديكور",
      category_description: "",
      category_description_french: "",
      category_url: "decor",
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
      category_list_title: "Decor",
      category_list_description: "",
      category_list_image: "",
      discount_type: 0,
      discount_value: 0,
    },
    {
      category_id: 3,
      main_category_id: 1,
      sub_category_id: 2,
      category_name: "Storage",
      category_name_french: "تخزين",
      category_description: "",
      category_description_french: "",
      category_url: "storage",
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
      category_list_title: "Storage",
      category_list_description: "",
      category_list_image: "",
      discount_type: 0,
      discount_value: 0,
    },
    {
      category_id: 4,
      main_category_id: 1,
      sub_category_id: 3,
      category_name: "Tableware",
      category_name_french: "أدوات المائدة",
      category_description: "",
      category_description_french: "",
      category_url: "tableware",
      category_icon: "",
      category_image: "",
      color_code: "",
      category_mapping: "",
      home_category_order: 3,
      home_category: 1,
      category_status: 1,
      product: 1,
      customize_type: 0,
      type: 0,
      sort_order: 3,
      menu_sort_order: 3,
      category_list_title: "Tableware",
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
      deal_title: "Ceramic Storage Jar",
      deal_title_french: "برطمان تخزين سيراميك",
      url_title: "ceramic-storage-jar",
      deal_key: "ceramic-storage-jar",
      deal_description:
        "A timeless ceramic storage jar crafted for modern Kuwaiti homes. Simple form, premium finish.",
      deal_description_french: "",
      brand_id: 1,
      terms_conditions: "",
      meta_description: "",
      meta_keywords: "",
      meta_description_french: "",
      meta_keywords_french: "",
      category_ids: "1,3",
      category_id: 3,
      sub_category_id: 2,
      sec_category_id: 0,
      third_category_id: 0,
      deal_type: 1,
      deal_value: 22,
      deal_price: 28,
      deal_savings: 6,
      shop_id: 1,
      deal_percentage: 21,
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
      tags: "storage,ceramic,home",
      cat_tags: "",
      related_products: "102,103",
      is_customized: 0,
      having_size_color: 0,
      merchant_id: 1,
      shipping: 0,
      brand_names: "GOZO HOME",
      supplier_names: "",
      supplier_id: 0,
      ballon_filling_option: "",
    },
    {
      deal_id: 102,
      deal_title: "Handcrafted Ceramic Bowl",
      deal_title_french: "وعاء سيراميك مصنوع يدوياً",
      url_title: "handcrafted-ceramic-bowl",
      deal_key: "ceramic-bowl",
      deal_description:
        "Unique handcrafted ceramic bowl for everyday tableware with a premium, modern feel.",
      deal_description_french: "",
      brand_id: 1,
      terms_conditions: "",
      meta_description: "",
      meta_keywords: "",
      meta_description_french: "",
      meta_keywords_french: "",
      category_ids: "1,4",
      category_id: 4,
      sub_category_id: 3,
      sec_category_id: 0,
      third_category_id: 0,
      deal_type: 1,
      deal_value: 14,
      deal_price: 18,
      deal_savings: 4,
      shop_id: 1,
      deal_percentage: 22,
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
      tags: "tableware,ceramic,bowl",
      cat_tags: "",
      related_products: "101,103",
      is_customized: 0,
      having_size_color: 0,
      merchant_id: 1,
      shipping: 0,
      brand_names: "GOZO HOME",
      supplier_names: "",
      supplier_id: 0,
      ballon_filling_option: "",
    },
    {
      deal_id: 103,
      deal_title: "Brass Candle Holder",
      deal_title_french: "حامل شموع نحاسي",
      url_title: "brass-candle-holder",
      deal_key: "brass-candle-holder",
      deal_description:
        "Elegant brass candle holder — craftsmanship meets simple modern decor.",
      deal_description_french: "",
      brand_id: 1,
      terms_conditions: "",
      meta_description: "",
      meta_keywords: "",
      meta_description_french: "",
      meta_keywords_french: "",
      category_ids: "1,2",
      category_id: 2,
      sub_category_id: 1,
      sec_category_id: 0,
      third_category_id: 0,
      deal_type: 1,
      deal_value: 29,
      deal_price: 35,
      deal_savings: 6,
      shop_id: 1,
      deal_percentage: 17,
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
      tags: "decor,candle,brass",
      cat_tags: "",
      related_products: "101,102",
      is_customized: 0,
      having_size_color: 0,
      merchant_id: 1,
      shipping: 0,
      brand_names: "GOZO HOME",
      supplier_names: "",
      supplier_id: 0,
      ballon_filling_option: "",
    },
    {
      deal_id: 104,
      deal_title: "Serving Tray Set",
      deal_title_french: "طقم صينية تقديم",
      url_title: "serving-tray-set",
      deal_key: "serving-tray-set",
      deal_description:
        "Premium serving tray set — unique elegant home accessories for hosting.",
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
      deal_value: 45,
      deal_price: 55,
      deal_savings: 10,
      shop_id: 1,
      deal_percentage: 18,
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
      tags: "offer,tray,tableware",
      cat_tags: "",
      related_products: "101,102",
      is_customized: 0,
      having_size_color: 0,
      merchant_id: 1,
      shipping: 0,
      brand_names: "GOZO HOME",
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
    country_name: "Kuwait",
    country_code: "KW",
    country_status: 1,
    ISO_country_code: "KW",
  });
  await models.state.collection.insertOne({
    state_id: 22,
    state_name: "Al Asimah",
    state_name_arabic: "العاصمة",
    state_country_id: 254,
    statestatus: 1,
  });
  await models.city.collection.insertOne({
    city_id: 132,
    country_id: 254,
    stateid: 22,
    city_name: "Kuwait City",
    city_name_french: "مدينة الكويت",
    delivery_charge: 2,
    city_status: 1,
  });

  // IDs must match cms.controller.js (ABOUTUS=6, TERMS=8, PRIVACY=33, FAQS=56)
  await models.cms.collection.insertMany([
    {
      cms_id: 6,
      cms_title: "About Us",
      cms_title_french: "من نحن",
      cms_desc:
        "<p><strong>GOZO HOME</strong> (جوزو هوم) is a modern Kuwaiti home accessories brand. We design unique, elegant, high-quality pieces with a focus on craftsmanship, simplicity, and timeless style.</p><p><em>THE JOY OF DECORS CRAFTED</em></p>",
      cms_desc_french:
        "<p><strong>جوزو هوم</strong> علامة كويتية عصرية لإكسسوارات المنزل. نصمم قطعاً فريدة وأنيقة عالية الجودة تجمع بين الحرفية والبساطة والأناقة الخالدة.</p><p><em>THE JOY OF DECORS CRAFTED</em></p>",
      cms_url: "about-us",
      type: 0,
      cms_status: 1,
    },
    {
      cms_id: 8,
      cms_title: "Terms and Conditions",
      cms_title_french: "الشروط والأحكام",
      cms_desc: "<p>Terms and conditions content.</p>",
      cms_desc_french: "<p>محتوى الشروط والأحكام.</p>",
      cms_url: "terms-and-conditions",
      type: 0,
      cms_status: 1,
    },
    {
      cms_id: 33,
      cms_title: "Privacy Policy",
      cms_title_french: "سياسة الخصوصية",
      cms_desc: "<p>Privacy policy content.</p>",
      cms_desc_french: "<p>محتوى سياسة الخصوصية.</p>",
      cms_url: "privacy-policy",
      type: 0,
      cms_status: 1,
    },
    {
      cms_id: 56,
      cms_title: "FAQs",
      cms_title_french: "الأسئلة الشائعة",
      cms_desc:
        "<p><strong>How do I place an order?</strong><br/>Add products to cart and checkout with Cash on Delivery.</p>",
      cms_desc_french:
        "<p><strong>كيف أقدم طلباً؟</strong><br/>أضف المنتجات إلى السلة وأكمل الدفع عند الاستلام.</p>",
      cms_url: "faqs",
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
    email: "demo@gozohome.com",
    password: md5(demoPassword),
    originalPassword: demoPassword,
    phone_number: "96500000000",
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
    address1: "Kuwait",
    address2: "Home Accessories",
    dob: "",
    my_favouites: "",
    payment_account_id: "",
    ship_name: "Demo User",
    ship_address1: "Kuwait",
    ship_address2: "Home Accessories",
    ship_state: "Al Asimah",
    ship_mobileno: "96500000000",
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
    replay_to_mail: "noreply@gozohome.com",
    from_name: "GOZO HOME",
    status: 1,
  });

  await models.notification_template.collection.insertMany([
    {
      id: 20,
      email_from: "noreply@gozohome.com",
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
      email_from: "noreply@gozohome.com",
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
      email_from: "noreply@gozohome.com",
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
      email_from: "noreply@gozohome.com",
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
      email_from: "noreply@gozohome.com",
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
    { _id: "banner_image", seq: 3 },
    { _id: "category", seq: 720 },
    { _id: "product", seq: 104 },
    { _id: "sub_products", seq: subProducts.length },
    { _id: "country", seq: 254 },
    { _id: "state", seq: 22 },
    { _id: "city", seq: 132 },
    { _id: "cms", seq: 56 },
    { _id: "users", seq: 2 },
    { _id: "email_settings", seq: 1 },
    { _id: "notification_template", seq: 24 },
  ]);

  setupImages(products, banners);

  // Always recreate admin after demo wipe so admin panel login keeps working
  const admin = await ensureAdminUser(models);
  await Counter.findOneAndUpdate(
    { _id: "users" },
    { $set: { seq: Math.max(2, admin.user_id) } },
    { upsert: true }
  );

  console.log("Demo seed complete.");
  console.log("  Storefront login: demo@gozohome.com / Demo@123");
  console.log(`  Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
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
