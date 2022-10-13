const nodemailer = require("nodemailer");

sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      secure: true,
      port: 587,
      auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.NODEMAILER_FROM,
      to,
      subject,
      html,
    });
  } catch (e) {
    return res.status(500).send({
      isSuccess: false,
      message: "Email not sent",
    });
  }
};

module.exports = sendEmail;
