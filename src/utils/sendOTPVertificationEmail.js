const bcrypt = require("bcryptjs");
const OTP = require("../app/models/OTP");
const transporter = require("../config/nodemailer");
const sendOTPVerificationEmail = async (email, id, otp) => {
  try {
    const mailOptions = {
      from: "numberzero0909@gmail.com",
      to: email,
      subject: "Verify your email",
      html: `<div style="font-family: Arial, sans-serif; color: #333;">
            <p style="font-weight: bold;">Nhập <span style="color: blue;">${otp}</span> ở trang web để xác thực và hoàn thành đăng kí</p>
            <p style="font-weight: bold;">Mã OTP sẽ hết hạn sau 5 phút.</p>
       </div>`,
    };
    const hasedOtp = await bcrypt.hash(otp, 10);
    const newOtpVertification = new OTP({
      userId: id,
      otp: hasedOtp,
      email
    });
    await newOtpVertification.save();
    await transporter.sendMail(mailOptions);
    console.log("send otp successfully");
  } catch (error) {
    console.log("Error sending email:", error);
  }
};
module.exports = sendOTPVerificationEmail;
