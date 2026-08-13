/**
 * Upsert missing essentials without wiping catalog/cart data.
 * Usage: npm run seed:essentials
 *
 * Fixes common local crashes:
 * - notification_template (order emails)
 * - email_settings
 * - cms pages expected by storefront (ids 6, 8, 33, 56)
 */
require("dotenv").config();
const { connectMongo, disconnectMongo } = require("./connection");

const CMS_PAGES = [
  {
    cms_id: 6,
    cms_title: "About Us",
    cms_title_french: "من نحن",
    cms_desc: "<p>Premium honey from Manahel Althunayyan.</p>",
    cms_desc_french: "<p>عسل فاخر من مناحل الثنيان.</p>",
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
];

const TEMPLATES = [
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
];

async function seedEssentials() {
  const mongoose = await connectMongo();
  const db = mongoose.connection.db;

  for (const page of CMS_PAGES) {
    await db
      .collection("cms")
      .updateOne({ cms_id: page.cms_id }, { $set: page }, { upsert: true });
  }

  for (const template of TEMPLATES) {
    await db
      .collection("notification_template")
      .updateOne({ id: template.id }, { $set: template }, { upsert: true });
  }

  const emailSettings = {
    settings_id: 1,
    sendgrid_host: "",
    sendgrid_port: 587,
    sendgrid_username: "",
    sendgrid_password: "",
    smtp_host: "smtp.gmail.com",
    smtp_port: 465,
    smtp_type: "ssl",
    smtp_username: "",
    smtp_password: "",
    api_key: "",
    list_id: "",
    replay_to_mail: "noreply@thunayanhoneyuae.com",
    from_name: "Thunayyan Honey UAE",
    status: 1,
  };
  await db
    .collection("email_settings")
    .updateOne(
      { settings_id: 1 },
      { $set: emailSettings },
      { upsert: true }
    );

  // Ensure sub_product sale price is usable when discount was left at 0
  await db.collection("sub_products").updateMany(
    { $or: [{ discount: 0 }, { discount: null }, { discount: { $exists: false } }], price: { $gt: 0 } },
    [{ $set: { discount: "$price" } }]
  );

  console.log("Essentials upserted:");
  console.log("  cms:", await db.collection("cms").countDocuments({ cms_id: { $in: [6, 8, 33, 56] } }));
  console.log(
    "  notification_template:",
    await db.collection("notification_template").countDocuments({})
  );
  console.log(
    "  email_settings:",
    await db.collection("email_settings").countDocuments({})
  );

  await disconnectMongo();
}

seedEssentials().catch(async (err) => {
  console.error(err);
  try {
    await disconnectMongo();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});
