const mongoose = require("mongoose");
const crypto = require("crypto");
const Schema = mongoose.Schema;


function validateEmail(value){
  const regex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
  return regex.test(value);
}
const user = Schema(
  {
    name: { 
      type: String, 
      required: [true, "User name is required"],
      
    },
    email: { 
      type: String, 
      required: true,
      validate: {
        validator: validateEmail,
        message: props => `${props.value} is not a valid email!`
      }
    },
    sex: {
      type: String,
      enum: {
        values: ["male", "female", ""],
        message: '{VALUE} is not supported'
      } 
    },
    password: { type: String, required: true},
    readingChapterCount: {type: Number, default: 0},
    level: { type: Number, default: 0 },
    process: { type: Number, min: 0, max: 99.99, default: 0 },
    imgSrc: { type: String},
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    seen:{
      type: Map,
      of: String,
    },// lưu dạng "chap-x" : "Tên truyện hoặc id truyện"// quản lí tiến độ đọc truyện
    follow: [{ type: Schema.Types.ObjectId, ref: "Story" }],
    point: { type: Number, default: 0 },
    verify: { type: Boolean, default: false },
    class: { type: String, default: "Thường dân" },

    frame: { type: Schema.Types.ObjectId, ref: "AvatarBorder" },
    buyingFrameDate: Date,
    frameExpiryDate: Date,
    
    readingHistory: { type: Schema.Types.ObjectId, ref: "ReadingHistory" },

    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
  },
  {
    versionKey: false,
    timeStamp: true,
  }
);


user.methods.validatePassword = function(value){
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/;
  return regex.test(value);
}

user.methods.createResetPasswordToken = function(){
  const resetToken = crypto.randomBytes(16).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    
  this.resetPasswordTokenExpires = Date.now() + 60 * 60 * 1000;
  return resetToken;
};

user.methods.calculateFrameExpiryDate = function(duration){
  this.frameExpiryDate = new Date(Date.now() + duration);
  return this.frameExpiryDate;
}

const User = mongoose.model("User", user);

module.exports = User;
