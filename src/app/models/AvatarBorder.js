const mongoose = require("mongoose");

const avatarBorder = new mongoose.Schema({
    imgSrc: {type: String, required: true},
    price: {type: Number, default: 100},
    expiry: {type: String, default: '1d'},
    duration: Number,
})

avatarBorder.pre('save', function(next) {
    const durations = {
        '1d': 24 * 60 * 60 * 1000,
        '2d': 2 * 24 * 60 * 60 * 1000,
        '1w':  7 * 24 * 60 * 60 * 1000,
    };
    if (this.expiry && durations[this.expiry]) {
        this.duration = new Date(Date.now() + durations[this.expiry]);
    } else {
        this.duration = new Date(Date.now() + durations['1d']);
    }
    next();
});
//[] cho phép truy cập linh động
const AvatarBorder = mongoose.model("AvatarBorder", avatarBorder);

module.exports = AvatarBorder;