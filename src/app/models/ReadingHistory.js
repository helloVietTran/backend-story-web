const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ReadingHistorySchema = new Schema(
  {
    userId: { type: String, index: true, required: true },
    readStories: [
      {
        storyId: { type: String, default: ""},
        storyName: { type: String, default: ""},
        imgSrc: { type: String, default: ""},
        chapters: [{type: Number, default: []}],
        slug: { type: String, default: ""},
        readAt: {type: Date, default: Date.now()}
      },
    ],
  },
  {
    versionKey: false,
  }
);

const ReadingHistory = mongoose.model("ReadingHistory", ReadingHistorySchema);

module.exports = ReadingHistory;
