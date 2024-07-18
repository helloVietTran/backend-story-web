const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  story: { type: mongoose.Schema.Types.ObjectId, ref: "Story"},
  atChapter: String,
  content: { type: String, required: true },
  replies: [{type: mongoose.Schema.Types.ObjectId, ref: "Reply"}],
  likeCount: { type: Number, default: 0 },
  dislikeCount: { type: Number, default: 0 },
  likedBy: [String],
  dislikedBy: [String],
  createdAt: {type: Date, default: Date.now()},
},{
  versionKey: false,
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
