require("dotenv").config();
const User = require("../models/User");
const OTP = require("../models/OTP");
const RefreshToken = require("../models/RefreshToken");
const ReadingHistory = require("../models/ReadingHistory");
const Point = require("../models/Point");

const sendResetPasswordEmail = require("../../utils/sendResetPasswordEmail");
const sendOTPVerificationEmail = require("../../utils/sendOTPVertificationEmail");
const CustomError = require("../../error/CustomError")

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class authController {

  async autoLogin(req, res, next) {
    try {
      const user = await User.findById(req.id)
      .populate({
        path: "frame",
        select: "imgSrc",
      })
      .exec();
    
      if (!user) {
        throw new CustomError("Can not auto login", 404)
      }
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email: email });
      const isValidatePassword = existingUser.validatePassword(password);
      if (!existingUser) {
        throw new CustomError("User doesnt exist", 404, "/auth/login");
      }
      if(existingUser && !existingUser.verify){
        const otp = Math.floor(Math.random() * 900000 + 100000).toString();
        sendOTPVerificationEmail(email, existingUser._id, otp);
        return res.json({
          id: existingUser._id,
          expiresAt: Date.now() + 5*60*1000,
        })
      }
      if(!isValidatePassword){
        throw new CustomError("Password is too short, too long, or has special character", 400,"/auth/register");
      }
      const isPasswordCorrect = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isPasswordCorrect) {
        throw new CustomError("Password is not correct", 400, "/auth/login");
      }
      // gửi token
      const accessToken = jwt.sign({ id: existingUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
      const refreshToken = jwt.sign({id: existingUser._id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d"});
      //xóa token
      await RefreshToken.findOneAndDelete({userId: existingUser._id});
      //tạo mới token
      await RefreshToken.create({token: refreshToken, userId: existingUser._id, expiresAt: Date.now() + 7*24*60*60*1000});

      res.status(200).json({
        token: accessToken,
        refreshToken,
        user: existingUser
      });
    } catch (err) {
      next(err);
    }
  }

  async register(req, res, next) {
    const { email, password, userName } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new CustomError("Email aldready exist", 400,"/auth/register");
      }

      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
      const newUser = await new User({
        email,
        password: hashedPassword,
        name: userName,
      });
      await newUser.save();

      const otp = Math.floor(Math.random() * 900000 + 100000).toString();
      sendOTPVerificationEmail(email, newUser._id, otp);

      res.json({
        message: "OTP has sent",
      })
    } catch (err) {
      next(err);
    }
  }

  async verifyOTP(req, res, next) {
    const { email, otp } = req.body;
    try {
      const user = await User.findOne({email: email});

      if (!user) {
        throw new CustomError("Cant not find user", 400, "/auth/verifyOTP");
      }

      const otpVerification = await OTP.findOne({ email });
      const isOTPCorrect = await bcrypt.compare(otp, otpVerification.otp);

      if (!otpVerification || !isOTPCorrect) {
        throw new CustomError("Invalid OTP", 400, "/auth/verifyOTP");
      }
      // Nếu OTP đã hết hạn, xóa nó khỏi cơ sở dữ liệu
      if (otpVerification.expiresAt < Date.now()) {
        await OTP.findOneAndDelete({email})

        return res.status(400).json({
          error: true,
          message: "OTP has expired. Please request a new one.",
        });
      }
      // nếu tất cả mọi thứ hợp lệ, tạo mới tài nguyên
      user.verify = true;
      await user.save();

      await ReadingHistory.create({userId: user._id});
      await OTP.findOneAndDelete({email});

      return res.status(200).json({
        message: "OTP verified successfully",
      });

    } catch (err) {
      next(err);
    }
  }
    // đổi mật khẩu
    async changePassword(req, res, next) {
      const { userId, password, newPassword } = req.body;
      try {
        const user = await User.findById(userId);
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        const isValidatePassword = user.validatePassword(newPassword);
        if(!isValidatePassword){
          throw new CustomError("New password is too short, too long, or has special character", 400,"/auth/register");
        }
        if (isPasswordCorrect) {
          const hashedPassword = await bcrypt.hash(newPassword, process.env.SALT_ROUND);
          user.password = hashedPassword;

          await user.save();

          return res.status(200).json({
            error: false,
            message: "Password has changed",
          });

        } else {
          throw new CustomError("Password is not correct", 400, '/auth/changePassword')
        }
      } catch (error) {
        next(error);
      }
    }

  // quên mật khẩu
  async forgotPassword(req, res) {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    try {
      if (!existingUser) {
        throw new CustomError("Email not found", 404, "/auth/forgot-password")
      }
      const resetToken = existingUser.createResetPasswordToken();
      existingUser.save();

      const resetUrl = `${req.protocol}://${process.env.FE_NAME}/reset-password?ticket=${resetToken}`;
      await sendResetPasswordEmail(email, resetUrl);
      
      res.status(200).json({
        message: "password reset link has sent into your email",
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { ticket } = req.query;
      const { newPassword } = req.body;

      const token = crypto.createHash("sha256").update(ticket).digest("hex");
      const user = await User.findOne({ resetPasswordToken: token });
      const isTokenExpired = user.resetPasswordTokenExpires < Date.now();
      
      if (!user || !isTokenExpired) {
        throw new CustomError("Reset token is ivalid or expired", 404, "/auth/reset-password")
      }

      const hasedPassword = await bcrypt.hash(newPassword, process.env.SALT_ROUND );
      user.password = hasedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpires = undefined;
      await user.save();

      res.status(200).json({
        message: "password has changed",
      });
    } catch (error) {
      next(error);
    }
  }
  async refreshToken(req, res, next){
    try {
      const refreshToken = req.body.refreshToken;
      if(!refreshToken) throw new CustomError("Cookies doesnt has token", 401, "/auth/refresh-token");

      const savedToken  = await RefreshToken.findOne({token: refreshToken});
      
      if(!savedToken) throw new CustomError("This token isnt in database", 403);

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      if(!decoded) throw new CustomError("Invalid token",403 );

      // cấp mới access token
      const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
      // cập nhật refresh token mới
      const newRefreshToken = jwt.sign({id: decoded.id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
      savedToken.token = newRefreshToken;
      savedToken.expiresAt = new Date(Date.now() + 7*24*60*60*1000);

      await savedToken.save();

      res.json({ token: accessToken, refreshToken: savedToken });
    } catch (error) {
      next(error);
    }
  }

  async logout (req, res){
    const id = req.id;
    try {
      await RefreshToken.deleteOne({ userId: id });
      res.sendStatus(204);
    } catch (error) {
      console.log(error);
    }
  }
  async resendOTP(req, res){
    try {
      const id = req.id;
      const {email} = req.body;
      await OTP.findOneAndDelete({email});
      const otp = Math.floor(Math.random() * 900000 + 100000).toString();
      sendOTPVerificationEmail(email, id , otp);
      res.json({
        message: "OTP has resend",
      })
    } catch (error) {
      res.status(500).json({
        message: "Cant resend OTP",
        path: "/auth/resendOTP"
      })
    }
  }
}

module.exports = new authController();
