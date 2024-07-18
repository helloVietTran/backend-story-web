const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otp = new Schema({
    userId : {type: String},
    email: {type: String,},
    otp: {type: String, required: true},
    createdAt: {type: Date, default: Date.now()},
    expiresAt : {type: Date, default: Date.now() + 5*60*1000}
})

otp.methods.isExpired = function() {
    return Date.now() >= this.expiresAt;
};
otp.methods.compareOtp = function(otpParam) {
    return this.otp === otpParam;
};

const OTP = mongoose.model('OTP', otp);
module.exports = OTP