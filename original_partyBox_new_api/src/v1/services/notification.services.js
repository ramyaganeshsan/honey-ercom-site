const {
  getValueFromRedis,
  setValueRedis,
  stringifyData,
  getCurrentTime,
  getMessage,
  parseData,
} = require("../utils");
const { findOne } = require("../mongo/repo");
const { sendEmail, sendEmailToAdmin } = require("../utils/notification");
const logger = require("../utils/logger");

const SUCCESS_EMAIL_TEMPLATE_ID = 20;
const CANCELLED_EMAIL_TEMPLATE_ID = 21;
const RETURN_EMAIL_TEMPLATE_ID = 22;
const ORDER_PLACED_ADMIN_EMAIL_TEMPLATE_ID = 23;
const NOTIFY_ADMIN_FOR_CONTACTUS_REGISTER = 24;
const ONE_DAT_IN_SECONDS = 86400;

const FALLBACK_TEMPLATES = {
  [SUCCESS_EMAIL_TEMPLATE_ID]: {
    subject: "Your order ##ORDER_ID## is confirmed",
    subject_ar: "تم تأكيد طلبك ##ORDER_ID##",
    template_content:
      "<p>Thank you for your order.</p><p>Order ID: <strong>##ORDER_ID##</strong></p><p>We will process it shortly.</p>",
    template_content_ar:
      "<p>شكراً لطلبك.</p><p>رقم الطلب: <strong>##ORDER_ID##</strong></p>",
  },
  [CANCELLED_EMAIL_TEMPLATE_ID]: {
    subject: "Your order ##ORDER_ID## was cancelled",
    subject_ar: "تم إلغاء طلبك ##ORDER_ID##",
    template_content:
      "<p>Your order <strong>##ORDER_ID##</strong> has been cancelled.</p>",
    template_content_ar:
      "<p>تم إلغاء طلبك <strong>##ORDER_ID##</strong>.</p>",
  },
  [RETURN_EMAIL_TEMPLATE_ID]: {
    subject: "Return request for order ##ORDER_ID##",
    subject_ar: "طلب إرجاع للطلب ##ORDER_ID##",
    template_content:
      "<p>We received a return request for order <strong>##ORDER_ID##</strong>.</p>",
    template_content_ar:
      "<p>استلمنا طلب إرجاع للطلب <strong>##ORDER_ID##</strong>.</p>",
  },
  [ORDER_PLACED_ADMIN_EMAIL_TEMPLATE_ID]: {
    subject: "New order placed ##ORDER_ID##",
    subject_ar: "طلب جديد ##ORDER_ID##",
    template_content:
      "<p>A new order was placed.</p><p>Order ID: <strong>##ORDER_ID##</strong></p>",
    template_content_ar:
      "<p>تم إنشاء طلب جديد.</p><p>رقم الطلب: <strong>##ORDER_ID##</strong></p>",
  },
  [NOTIFY_ADMIN_FOR_CONTACTUS_REGISTER]: {
    subject: "New contact us message from ##NAME##",
    subject_ar: "رسالة تواصل جديدة من ##NAME##",
    template_content:
      "<p>New contact request (##CONTACTID##).</p>##CONTENTTABLE##",
    template_content_ar:
      "<p>طلب تواصل جديد (##CONTACTID##).</p>##CONTENTTABLE##",
  },
};

const getEmailTemplate = async (templateId) => {
  try {
    const template = await findOne(
      "notification_template",
      { id: Number(templateId) },
      {
        attributes: [
          "subject",
          "subject_ar",
          "template_content",
          "template_content_ar",
        ],
      }
    );
    if (template?.template_content) return template;
  } catch (err) {
    logger.error(err);
  }
  return FALLBACK_TEMPLATES[Number(templateId)] || null;
};

const getSMTPDetails = async () => {
  let smtpSettings = {};

  try {
    let cachedSMTPDetails = await getValueFromRedis("SMTPDetails");
    if (cachedSMTPDetails) {
      let parsedResponse = parseData(cachedSMTPDetails);
      if (parsedResponse?.status && parsedResponse?.data) {
        smtpSettings = parsedResponse.data;
      }
    } else {
      smtpSettings = (await findOne("email_settings", {})) || {};
      if (smtpSettings && Object.keys(smtpSettings).length) {
        let stringifyResponse = stringifyData(smtpSettings);
        if (stringifyResponse?.status) {
          await setValueRedis(
            "SMTPDetails",
            stringifyResponse.data,
            ONE_DAT_IN_SECONDS
          );
        }
      }
    }
  } catch (err) {
    logger.error(err);
  }

  return smtpSettings || {};
};

const resolveLangFields = (lang) => {
  if (lang === "ar") {
    return {
      templateSubjectField: "subject_ar",
      templateContentField: "template_content_ar",
    };
  }
  return {
    templateSubjectField: "subject",
    templateContentField: "template_content",
  };
};

const loadCachedOrDbTemplate = async (cacheKey, templateId) => {
  try {
    const emailContent = await getValueFromRedis(cacheKey);
    if (emailContent) {
      const parsedResponse = parseData(emailContent);
      if (parsedResponse?.status && parsedResponse?.data?.template_content) {
        return parsedResponse.data;
      }
    }
  } catch (err) {
    logger.error(err);
  }

  const emailTemplate = await getEmailTemplate(templateId);
  if (emailTemplate?.template_content) {
    try {
      const stringifyResponse = stringifyData(emailTemplate);
      if (stringifyResponse?.status) {
        await setValueRedis(cacheKey, stringifyResponse.data, 300);
      }
    } catch (err) {
      logger.error(err);
    }
  }
  return emailTemplate;
};

const applyOrderId = (content, transactionId) =>
  String(content || "").replace(/##ORDER_ID##/g, String(transactionId ?? ""));

const hasSmtpAuth = (smtpSettings) =>
  Boolean(smtpSettings?.smtp_username && smtpSettings?.smtp_password);

exports.sendOrderSuccessEmail = async (transactionId, userDetails, lang) => {
  try {
    const { templateSubjectField, templateContentField } =
      resolveLangFields(lang);
    const emailTemplate = await loadCachedOrDbTemplate(
      "orderSuccessEmailTemplate",
      SUCCESS_EMAIL_TEMPLATE_ID
    );
    if (!emailTemplate?.[templateContentField] && !emailTemplate?.template_content) {
      logger.warn("Order success email skipped: missing notification_template");
      return;
    }

    const content =
      emailTemplate[templateContentField] || emailTemplate.template_content;
    const subject =
      emailTemplate[templateSubjectField] ||
      emailTemplate.subject ||
      "Order confirmed";
    const replacedContent = applyOrderId(content, transactionId);
    const smtpSettings = await getSMTPDetails();

    if (!hasSmtpAuth(smtpSettings)) {
      logger.warn(
        "Order success email skipped: email_settings SMTP credentials missing"
      );
      return;
    }
    if (!userDetails?.email) {
      logger.warn("Order success email skipped: customer email missing");
      return;
    }

    await sendEmail(
      applyOrderId(subject, transactionId),
      replacedContent,
      smtpSettings.smtp_username,
      smtpSettings.smtp_password,
      userDetails,
      smtpSettings.from_name || "Thunayyan Honey"
    );
  } catch (err) {
    console.error("sendOrderSuccessEmail failed:", err?.message || err);
    logger.error(err);
  }
};

exports.sendOrderSuccessEmailToAdmin = async (
  transactionId,
  userDetails,
  lang
) => {
  try {
    const { templateSubjectField, templateContentField } =
      resolveLangFields(lang);
    const emailTemplate = await loadCachedOrDbTemplate(
      "orderPlacedNotificationAdmin",
      ORDER_PLACED_ADMIN_EMAIL_TEMPLATE_ID
    );
    if (!emailTemplate?.[templateContentField] && !emailTemplate?.template_content) {
      logger.warn("Admin order email skipped: missing notification_template");
      return;
    }

    const content =
      emailTemplate[templateContentField] || emailTemplate.template_content;
    const subject =
      emailTemplate[templateSubjectField] ||
      emailTemplate.subject ||
      "New order placed";
    const replacedContent = applyOrderId(content, transactionId);
    const smtpSettings = await getSMTPDetails();

    if (!hasSmtpAuth(smtpSettings)) {
      logger.warn(
        "Admin order email skipped: email_settings SMTP credentials missing"
      );
      return;
    }
    if (!userDetails?.adminEmailAddress) {
      logger.warn("Admin order email skipped: adminEmailAddress missing");
      return;
    }

    await sendEmailToAdmin(
      applyOrderId(subject, transactionId),
      replacedContent,
      smtpSettings.smtp_username,
      smtpSettings.smtp_password,
      userDetails,
      smtpSettings.from_name || "Thunayyan Honey"
    );
  } catch (err) {
    console.error("sendOrderSuccessEmailToAdmin failed:", err?.message || err);
    logger.error(err);
  }
};

exports.notifyContactUsToAdminEmail = async (
  name,
  contactId,
  phone,
  email,
  notes,
  userDetails,
  lang
) => {
  try {
    const { templateSubjectField, templateContentField } =
      resolveLangFields(lang);
    const emailTemplate = await loadCachedOrDbTemplate(
      "constactUsRegisterNotificationAdmin",
      NOTIFY_ADMIN_FOR_CONTACTUS_REGISTER
    );
    if (!emailTemplate?.[templateContentField] && !emailTemplate?.template_content) {
      logger.warn("Contact-us admin email skipped: missing notification_template");
      return;
    }

    const smtpSettings = await getSMTPDetails();
    if (!hasSmtpAuth(smtpSettings)) {
      logger.warn(
        "Contact-us admin email skipped: email_settings SMTP credentials missing"
      );
      return;
    }

    const contentTable = `
    <div style="display:flex;justify-content:center;align-items:center;">
      <div style="width:500px;">
        <ul style="list-style-type: none; padding: 0; margin: 0;">
          <li style="padding: 8px;">
            <strong>Name:</strong> ${name}
          </li>
          <li style="padding: 8px;">
            <strong>Phone:</strong> ${phone}
          </li>
          <li style="padding: 8px;">
            <strong>Email:</strong> ${email}
          </li>
          <li style="padding: 8px;">
            <strong>Notes:</strong> ${notes}
          </li>
        </ul>
      </div>
    </div>
  `;

    const content =
      emailTemplate[templateContentField] || emailTemplate.template_content;
    const subject =
      emailTemplate[templateSubjectField] ||
      emailTemplate.subject ||
      "New contact us message";

    const replacedContent = String(content)
      .replace(/##NAME##/g, name)
      .replace(/##CONTACTID##/g, contactId)
      .replace(/##CONTENTTABLE##/g, contentTable);

    await sendEmailToAdmin(
      String(subject).replace(/##NAME##/g, name),
      replacedContent,
      smtpSettings.smtp_username,
      smtpSettings.smtp_password,
      userDetails,
      smtpSettings.from_name || "Thunayyan Honey"
    );
  } catch (err) {
    console.error("notifyContactUsToAdminEmail failed:", err?.message || err);
    logger.error(err);
  }
};

exports.sendOrderCancelEmail = async (transactionId, userDetails, lang) => {
  try {
    const { templateSubjectField, templateContentField } =
      resolveLangFields(lang);
    const emailTemplate = await loadCachedOrDbTemplate(
      "ordercancelledEmailTemplate",
      CANCELLED_EMAIL_TEMPLATE_ID
    );
    if (!emailTemplate?.[templateContentField] && !emailTemplate?.template_content) {
      logger.warn("Cancel email skipped: missing notification_template");
      return;
    }

    const smtpSettings = await getSMTPDetails();
    if (!hasSmtpAuth(smtpSettings) || !userDetails?.email) return;

    const content =
      emailTemplate[templateContentField] || emailTemplate.template_content;
    const subject =
      emailTemplate[templateSubjectField] ||
      emailTemplate.subject ||
      "Order cancelled";

    await sendEmail(
      applyOrderId(subject, transactionId),
      applyOrderId(content, transactionId),
      smtpSettings.smtp_username,
      smtpSettings.smtp_password,
      userDetails,
      smtpSettings.from_name || "Thunayyan Honey"
    );
  } catch (err) {
    console.error("sendOrderCancelEmail failed:", err?.message || err);
    logger.error(err);
  }
};

exports.sendOrderReturnEmail = async (transactionId, userDetails, lang) => {
  try {
    const { templateSubjectField, templateContentField } =
      resolveLangFields(lang);
    const emailTemplate = await loadCachedOrDbTemplate(
      "orderReturnedEmailTemplate",
      RETURN_EMAIL_TEMPLATE_ID
    );
    if (!emailTemplate?.[templateContentField] && !emailTemplate?.template_content) {
      logger.warn("Return email skipped: missing notification_template");
      return;
    }

    const smtpSettings = await getSMTPDetails();
    if (!hasSmtpAuth(smtpSettings) || !userDetails?.email) return;

    const content =
      emailTemplate[templateContentField] || emailTemplate.template_content;
    const subject =
      emailTemplate[templateSubjectField] ||
      emailTemplate.subject ||
      "Order return";

    await sendEmail(
      applyOrderId(subject, transactionId),
      applyOrderId(content, transactionId),
      smtpSettings.smtp_username,
      smtpSettings.smtp_password,
      userDetails,
      smtpSettings.from_name || "Thunayyan Honey"
    );
  } catch (err) {
    console.error("sendOrderReturnEmail failed:", err?.message || err);
    logger.error(err);
  }
};

exports.sendProductOutOfStockEmail = async (
  productDetails,
  tableHeader,
  email = ""
) => {
  try {
    let currentDate = getCurrentTime().format("YYYY-MM-DD");

    let table = `
    <div style="display:flex;justify-content:center;align-items:center;">
      <div style = width:500px >
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <h4 style="margin:0;padding: 12px 0px;">Date: ${currentDate}</h4>`;

    table += "<tr>";
    tableHeader.forEach((colName) => {
      table += `
      <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2;">
        ${getMessage(colName)}
      </th>`;
    });
    table += "</tr>";

    productDetails.forEach((rowData) => {
      table += "<tr>";
      tableHeader.forEach((colName) => {
        table += `
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
          ${rowData[colName] ? rowData[colName] : "-"}
        </td>`;
      });
      table += "</tr>";
    });

    table += `</table></div></div>`;

    let smtpSettings = await getSMTPDetails();
    if (!hasSmtpAuth(smtpSettings) || !email) {
      logger.warn("Out-of-stock email skipped: SMTP or recipient missing");
      return;
    }

    await sendEmail(
      "Reminder for Out of stock product.",
      table,
      smtpSettings?.smtp_username,
      smtpSettings?.smtp_password,
      { email: email },
      smtpSettings.from_name || "Thunayyan Honey"
    );
  } catch (err) {
    console.error("sendProductOutOfStockEmail failed:", err?.message || err);
    logger.error(err);
  }
};
