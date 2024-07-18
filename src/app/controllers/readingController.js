const User = require("../models/User");
const ReadingHistory = require("../models/ReadingHistory");

class ReadingController {
  async index(req, res) {
    try {
      const userId = req.id;
      const history = await ReadingHistory.findOne({ userId });
      res.json(history);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }

  async addStory(req, res) {
    try {
      const { storyName, imgSrc, chapter, slug, storyId } = req.body;
      let history = await ReadingHistory.findOne({ userId: req.id });
      console.log("chapter: " + chapter);
      
      let existingIndex = history.readStories.findIndex(
        (item) => item.slug === slug
      );
      // Nếu truyện đã được đọc trước đó, cập nhật thông tin chương
      if (existingIndex !== -1) {
        let chapterExistingIndex = history.readStories[existingIndex].chapters.findIndex(
          (chap) => chap === parseInt(chapter)
        );
        console.log(chapterExistingIndex);
        if(chapterExistingIndex === -1){
         history.readStories[existingIndex].chapters.push(parseInt(chapter))
        }
      } 
      // Nếu truyện chưa được đọc trước đó, thêm vào lịch sử
      else {
        history.readStories.push({
          storyId,
          storyName,
          imgSrc,
          chapters: [parseInt(chapter)],
          slug,
        });
      }

      await history.save();
      res.status(200).end();
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }

  async deleteStory(req, res) {
    try {
      const userId = req.id;
      const { id } = req.params;
      const history = await ReadingHistory.findOne({ userId });
      const updatedHistory = history.visited_stories.filter((item) => {
        return item._id !== id;
      });
      history.visited_stories = updatedHistory;
      await history.save();
      res.status(200).end();
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
}
module.exports = new ReadingController();
