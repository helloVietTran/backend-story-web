const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refreshToken = new Schema({
    userId : {type: String, required: true},
    token: {type: String, required: true},
    expiresAt : Date
})

refreshToken.methods.isExpired = function() {
    return Date.now() >= this.expiresAt;
};

const RefreshToken = mongoose.model('RefreshToken', refreshToken);
module.exports = RefreshToken