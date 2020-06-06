const nodemailer = require("nodemailer");

module.exports.sendForgotEmail = async (to) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "bookingclik.com",
    port: 25,
    maxConnections: 5,
    maxMessages: 10
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'noreply@bookingclik.com', // sender address
    to: to, // list of receivers
    subject: "Recover password", // Subject line
    text: "Click here to recover your password", // plain text body
    // html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}