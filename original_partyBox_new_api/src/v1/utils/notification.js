const logger = require("./logger");
const nodemailer = require("nodemailer");

exports.sendEmail = async (
  templateSubjectField,
  replacedContent,
  senderEmail,
  senderPassword,
  userDetails,
  fromName
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 587,
      secure: false,
      auth: {
        user: senderEmail,
        pass: senderPassword,
      },
      debug: true,
    });

    const mailOptions = {
      from: `${fromName} <${senderEmail}>`,
      to: userDetails.email,
      subject: templateSubjectField,
      html: replacedContent,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error.message);
    logger.error(error);
  }
};

exports.sendEmailToAdmin = async (
  templateSubjectField,
  replacedContent,
  senderEmail,
  senderPassword,
  userDetails,
  fromName
) => {
  try {
    console.log("calling the function sendEmailToAdmin");
    const transporter = nodemailer.createTransport({
      // host: "smtpout.secureserver.net",
      // port: 587,
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: senderEmail,
        pass: senderPassword,
      },
      debug: true,
    });

    const mailOptions = {
      from: `${fromName} <${senderEmail}>`,
      to: userDetails.adminEmailAddress,
      subject: templateSubjectField,
      html: replacedContent,
    };
    console.log("mailOptions : ", mailOptions);
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error.message);
    logger.error(error);
  }
};
