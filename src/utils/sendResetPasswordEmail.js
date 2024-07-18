const transporter = require("../config/nodemailer");
const sendResetPasswordEmail = async (email, resetUrl) => {
    try {
        const mailOptions = {
            from: "numberzero0909@gmail.com",
            to: email,
            subject: "Reset password in viettruyen",
            html: `<p>Chào bạn,</p>
    
            <p>
                Bạn vừa thực hiện yêu cầu phục hồi mật khẩu, để thay đổi mật khẩu, bạn vui lòng click vào đường link bên dưới:
            </p>
            <p>
                <a href="${resetUrl}" target="_blank" style="text-decoration: none; color: #007bff;">Reset Password</a>
            </p>
            <p>
                <strong>Lưu ý:</strong> Đường dẫn trên chỉ tồn tại trong vòng 1 giờ.
            </p>
            <p>
                Đây là email tự động, vui lòng không phản hồi lại trên email này.
            </p>
        
            <p>Trân trọng,<br>VietTruyen</p>`,
          };
          await transporter.sendMail(mailOptions);
    } catch (error) {
        console.log(error);
    }
}
module.exports = sendResetPasswordEmail;