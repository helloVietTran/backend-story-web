const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    replyTo: {type: String, required: true},
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
    likedBy: [String],
    dislikedBy: [String],
    createdAt: {type: Date, default: Date.now()},
  },{
    versionKey: false,
});

const Reply = mongoose.model("Reply", replySchema);
module.exports = Reply;