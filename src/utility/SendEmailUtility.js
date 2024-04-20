var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");

const SendEmailUtility = async (EmailTo, EmailText, EmialSubject) => {
  var transporter = nodemailer.createTransport(
    smtpTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.PASS_USER,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })
  );
  let mailOption = {
    from: " Task Manager <playergtax6@gmail.com>",
    to: EmailTo,
    subject: EmialSubject,
    text: EmailText,
  };
  return await transporter.sendMail(mailOption);
};

module.exports = SendEmailUtility;
