const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_PASSWORD,
  },
});

async function sendEmail(to, subject, message) {
  if (!to && !subject && !message) {
    throw new Error ("Required fields missing.")
  } else {
    try {
      transporter.sendMail({
        from: process.env.GOOGLE_EMAIL,
        to: to,
        subject: subject,
        text: message
      }, (err, info) => {
        if (err) console.error(err)
        else console.log("Email sent: " + info.response)
      })
    } catch (err) {
      console.error(err)
      throw new Error("Error sending email!")
    }
  }
}

module.exports = sendEmail;