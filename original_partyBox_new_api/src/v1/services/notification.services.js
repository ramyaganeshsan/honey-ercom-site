const {
  getValueFromRedis,
  setValueRedis,
  stringifyData,
  getCurrentTime,
  getMessage,
  parseData,
} = require("../utils");
const { notification_template, email_settings } = require("../models");
const { sendEmail, sendEmailToAdmin } = require("../utils/notification");
const { Console } = require("console");

const SUCCESS_EMAIL_TEMPLATE_ID = 20;
const CANCELLED_EMAIL_TEMPLATE_ID = 21;
const RETURN_EMAIL_TEMPLATE_ID = 22;
const ORDER_PLACED_ADMIN_EMAIL_TEMPLATE_ID = 23;
const NOTIFY_ADMIN_FOR_CONTACTUS_REGISTER = 24;
const ONE_DAT_IN_SECONDS = 86400;

const getEmailTemplate = async (templateId) => {
  const template = await notification_template.findOne({
    where: {
      id: templateId,
    },
    attributes: [
      "subject",
      "subject_ar",
      "template_content",
      "template_content_ar",
    ],
  });
  return template;
};

const getSMTPDetails = async () => {
  let smtpSettings = {};

  let cachedSMTPDetails = await getValueFromRedis("SMTPDetails");
  if (cachedSMTPDetails) {
    let parsedResponse = parseData(cachedSMTPDetails);
    if (parsedResponse?.status) smtpSettings = parsedResponse?.data;
  } else {
    smtpSettings = await email_settings.findOne();
    let stringifyResponse = stringifyData(smtpSettings);
    await setValueRedis(
      "SMTPDetails",
      stringifyResponse.data,
      ONE_DAT_IN_SECONDS
    );
  }

  return smtpSettings;
};

exports.sendOrderSuccessEmail = async (transactionId, userDetails, lang) => {
  let emailTemplate = {};

  let templateSubjectField = "subject";
  let templateContentField = "template_content";

  if (lang === "ar") {
    templateSubjectField = "subject_ar";
    templateContentField = "template_content_ar";
  }

  let emailContent = await getValueFromRedis("orderSuccessEmailTemplate");
  if (emailContent) {
    let parsedResponse = parseData(emailContent);
    if (parsedResponse?.status) emailTemplate = parsedResponse?.data;
  } else {
    emailTemplate = await getEmailTemplate(SUCCESS_EMAIL_TEMPLATE_ID);
    let stringifyResponse = stringifyData(emailTemplate);
    await setValueRedis(
      "orderSuccessEmailTemplate",
      stringifyResponse.data,
      300
    );
  }
  console.log("userDetails of customer  : ", userDetails);
  let smtpSettings = await getSMTPDetails();
  const replacedContent = emailTemplate[templateContentField].replace(
    "##ORDER_ID##",
    transactionId
  );
  sendEmail(
    emailTemplate[templateSubjectField],
    replacedContent,
    smtpSettings.smtp_username,
    smtpSettings.smtp_password,
    userDetails,
    smtpSettings.from_name
  );
};

exports.sendOrderSuccessEmailToAdmin = async (
  transactionId,
  userDetails,
  lang
) => {
  let emailTemplate = {};
  console.log("userDetails : ", userDetails);
  let templateSubjectField = "subject";
  let templateContentField = "template_content";

  if (lang === "ar") {
    templateSubjectField = "subject_ar";
    templateContentField = "template_content_ar";
  }

  let emailContent = await getValueFromRedis("orderPlacedNotificationAdmin");
  if (emailContent) {
    let parsedResponse = parseData(emailContent);
    if (parsedResponse?.status) emailTemplate = parsedResponse?.data;
  } else {
    emailTemplate = await getEmailTemplate(
      ORDER_PLACED_ADMIN_EMAIL_TEMPLATE_ID
    );
    let stringifyResponse = stringifyData(emailTemplate);
    await setValueRedis(
      "orderPlacedNotificationAdmin",
      stringifyResponse.data,
      300
    );
  }

  let smtpSettings = await getSMTPDetails();
  console.log("smtpSettings : ", smtpSettings);
  const replacedContent = emailTemplate[templateContentField].replace(
    "##ORDER_ID##",
    transactionId
  );
  sendEmailToAdmin(
    emailTemplate[templateSubjectField],
    replacedContent,
    smtpSettings.smtp_username,
    smtpSettings.smtp_password,
    userDetails,
    smtpSettings.from_name
  );
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
  console.log("calling the email content");
  console.log("contactId : ", contactId);
  console.log("name : ", name);
  let emailTemplate = {};
  console.log("userDetails : ", userDetails);
  let templateSubjectField = "subject";
  let templateContentField = "template_content";
  console.log("templateSubjectField  : ", templateSubjectField);
  console.log("templateContentField  : ", templateContentField);

  if (lang === "ar") {
    templateSubjectField = "subject_ar";
    templateContentField = "template_content_ar";
  }

  let emailContent = await getValueFromRedis(
    "constactUsRegisterNotificationAdmin"
  );
  if (emailContent) {
    let parsedResponse = parseData(emailContent);
    if (parsedResponse?.status) emailTemplate = parsedResponse?.data;
  } else {
    emailTemplate = await getEmailTemplate(NOTIFY_ADMIN_FOR_CONTACTUS_REGISTER);
    let stringifyResponse = stringifyData(emailTemplate);
    await setValueRedis(
      "constactUsRegisterNotificationAdmin",
      stringifyResponse.data,
      300
    );
  }

  let smtpSettings = await getSMTPDetails();

  const contentTable = `
    <div style="display:flex;justify-content:center;align-items:center;">
      <div style="width:500px;">
        <ul style="list-style-type: none; padding: 0; margin: 0;">
          <li style= padding: 8px; ">
            <strong>Name:</strong> ${name}
          </li>
          <li style=padding: 8px;">
            <strong>Phone:</strong> ${phone}
          </li>
          <li style=padding: 8px;">
            <strong>Email:</strong> ${email}
          </li>
          <li style=padding: 8px;">
            <strong>Notes:</strong> ${notes}
          </li>
        </ul>
      </div>
    </div>
  `;

  const replacedContent = emailTemplate[templateContentField]
    .replace("##NAME##", name)
    .replace(/##CONTACTID##/g, contactId)
    .replace(/##CONTENTTABLE##/g, contentTable);

  console.log("Replaced content with table: ", replacedContent);

  sendEmailToAdmin(
    emailTemplate[templateSubjectField],
    replacedContent,
    smtpSettings.smtp_username,
    smtpSettings.smtp_password,
    userDetails,
    smtpSettings.from_name
  );
};

exports.sendOrderCancelEmail = async (transactionId, userDetails, lang) => {
  let emailTemplate = {};

  let templateSubjectField = "subject";
  let templateContentField = "template_content";

  if (lang === "ar") {
    templateSubjectField = "subject_ar";
    templateContentField = "template_content_ar";
  }

  let emailContent = await getValueFromRedis("ordercancelledEmailTemplate");
  if (emailContent) {
    let parsedResponse = parseData(emailContent);
    if (parsedResponse?.status) emailTemplate = parsedResponse?.data;
  } else {
    emailTemplate = await getEmailTemplate(CANCELLED_EMAIL_TEMPLATE_ID);
    let stringifyResponse = stringifyData(emailTemplate);
    await setValueRedis(
      "ordercancelledEmailTemplate",
      stringifyResponse.data,
      300
    );
  }

  let smtpSettings = await getSMTPDetails();
  const replacedContent = emailTemplate[templateContentField].replace(
    "##ORDER_ID##",
    transactionId
  );
  sendEmail(
    emailTemplate[templateSubjectField],
    replacedContent,
    smtpSettings.smtp_username,
    smtpSettings.smtp_password,
    userDetails,
    smtpSettings.from_name
  );
};

exports.sendOrderReturnEmail = async (transactionId, userDetails, lang) => {
  let emailTemplate = {};

  let templateSubjectField = "subject";
  let templateContentField = "template_content";

  if (lang === "ar") {
    templateSubjectField = "subject_ar";
    templateContentField = "template_content_ar";
  }

  let emailContent = await getValueFromRedis("orderReturnedEmailTemplate");

  if (emailContent) {
    let parsedResponse = parseData(emailContent);
    if (parsedResponse?.status) emailTemplate = parsedResponse?.data;
  } else {
    emailTemplate = await getEmailTemplate(RETURN_EMAIL_TEMPLATE_ID);
    let stringifyResponse = stringifyData(emailTemplate);
    await setValueRedis(
      "orderReturnedEmailTemplate",
      stringifyResponse.data,
      300
    );
  }

  let smtpSettings = await getSMTPDetails();
  const replacedContent = emailTemplate[templateContentField].replace(
    "##ORDER_ID##",
    transactionId
  );

  sendEmail(
    emailTemplate[templateSubjectField],
    replacedContent,
    smtpSettings.smtp_username,
    smtpSettings.smtp_password,
    userDetails,
    smtpSettings.from_name
  );
};

exports.sendProductOutOfStockEmail = async (
  productDetails,
  tableHeader,
  email = ""
) => {
  let currentDate = getCurrentTime().format("YYYY-MM-DD");

  let table = `
    <div style="display:flex;justify-content:center;align-items:center;">
      <div style = width:500px >
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <h4 style="margin:0;padding: 12px 0px;">Date: ${currentDate}</h4>`;

  /* Table Header */
  table += "<tr>";
  tableHeader.forEach((colName) => {
    table += `
      <th style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: #f2f2f2;">
        ${getMessage(colName)}
      </th>`;
  });
  table += "</tr>";

  /* Table data */
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
  sendEmail(
    "Reminder for Out of stock product.",
    table,
    smtpSettings?.smtp_username,
    smtpSettings?.smtp_password,
    { email: email },
    smtpSettings.from_name
  );
};
