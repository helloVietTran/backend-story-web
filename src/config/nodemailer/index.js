const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "numberzero0909@gmail.com",
    pass: "xsxi dklb unau bwdl",// dùng mật khẩu đặc biệt
  },

});
module.exports = transporter;
