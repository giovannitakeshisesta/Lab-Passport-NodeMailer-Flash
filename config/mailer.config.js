const nodemailer = require('nodemailer');
const template = require('./mailtemplate');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NM_USER,
    pass: process.env.NM_PASSWORD
  }
})

// send mail with defined transport object
// `http://localhost:${process.env.PORT || 3000}`}/activate/${token}" 
module.exports.sendActivationEmail = (email, token) => {
  transporter.sendMail({
    from: `Giovanni !!!!! <${process.env.NM_USER}>`,
    to: email,
    subject: "Messaggio Subject",
    html: template.generateEmail(token)
  })
}