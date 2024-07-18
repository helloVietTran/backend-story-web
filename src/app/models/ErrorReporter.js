const mongoose = require("mongoose");

const errorReporter = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
  storyName: {type: String, required: true},
  atChapter: {type: Number, required: true},
  type: {type: String, required: true},
  description: {type: String, required: true},
}, {
  timestamps: true,
  versionKey: false,
});

const ErrorReporter = mongoose.model("ErrorReporter", errorReporter);

module.exports = ErrorReporter;