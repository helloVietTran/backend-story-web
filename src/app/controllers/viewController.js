const Chapter = require("../models/Chapter");
const Story = require("../models/Story");
const jwt = require("jsonwebtoken");
const CustomError = require("../../error/CustomError");
const mongoose = require("mongoose");

//const redisClient = require("../../config/db/init.redis");

class ViewController {
 //dùng ở môi trường phát triển
 /* async increase(req, res) {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    let decoded;
    if (token) {
      decoded = jwt.verify(token, "webdoctruyen");
    }
    try {
      const userId = decoded.id || req.ip;
      const { storyId, chapterId } = req.params;
      const key = `user::${userId}::${chapterId}`;
      //check xem có user đã xem trong vòng 6 phút hay chưa
      const keyExists = await new Promise((resolve, reject) => {
        redisClient.exists(key, (err, exists) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(exists);
        });
      });
      if (keyExists) {
        console.log("Key exists, not increasing view");
        return;
      }
      // set key cho người dùng tồn tại trong 6 phút
      await new Promise((resolve, reject) => {
        redisClient.set(key, "viewed", "EX", 360, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        });
      });

      const getChapterViewCount = await new Promise((resolve, reject) => {
        redisClient.get(
          `chapter::${chapterId}`,
          function (error, chapterViewCount) {
            if (error) {
              reject(error);
            }
            resolve(chapterViewCount);
          }
        );
      });

      const getStoryViewCount = await new Promise((resolve, reject) => {
        redisClient.get(
          `story::${storyId}`,
          function (error, storyViewCount) {
            if (error) {
              reject(err);
            }
            resolve(storyViewCount);
          }
        );
      });
      const [chapterViewCount, storyViewCount] = await Promise.all([
        getChapterViewCount,
        getStoryViewCount,
      ]);
      // incr view count chapter
      if (chapterViewCount !== null) {
        redisClient.incr(`chapter::${chapterId}`);
      }
      const chapter = await Chapter.findByIdAndUpdate(
        chapterId,
        { $inc: { view_count: 1 } },
        { new: true }
      );
      if (!chapter) {
        console.log("Cant not find chapter");
        res.status(404).end();
      }
      const newViewCount = chapter.view_count;
      redisClient.set(`chapter::${chapter._id}`, newViewCount);
      // incr view count story
      if (storyViewCount !== null) {
        redisClient.incr(`story::${storyId}`);
      }
      const story = await Story.findByIdAndUpdate(
        storyId,
        { $inc: { view_count: 1 } },
        { new: true }
      );
      if (!story) {
        console.log("Cant not find chapter");
        res.status(404).end();
      }
      const newStoryViewCount = story.view_count;
      redisClient.set(`story::${story._id}`, newStoryViewCount);
      console.log('increase view')
      res.end();
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Cant update view",
      });
    }
  }*/

    async increase(req, res, next) {
      try {
        const { storyId } = req.params;

        const chapter = await Chapter.findOneAndUpdate(
          {story: new mongoose.Types.ObjectId(storyId) },
          { $inc: { viewCount: 1 } },
          { new: true }
        );
    
        if (!chapter) {
          throw new CustomError("Incr view chapter failed", 500, "/view-count/increase")
        }
        const story = await Story.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(storyId) },
          { $inc: { [`chapters.${chapter._id.toString()}.viewCount`]: 1 } },
          { $inc: { viewCount: 1 } },
          { new: true }
        );
    
        
       if (!story) {
         throw new CustomError("Incr view story failed", 500, "/view-count/increase")
        }
    
        res.status(200).json({
          message: 'View count increased',
        });
      } catch (error) {
        next(error)
      }
    }

}
module.exports = new ViewController();
/*  //incr view_count story
      client.get(`story::${storyId}`, async function (err, viewCount) {
        if (err) {
          console.error("Error fetching view count from Redis:", err);
          res.status(500).json({ error: "Internal Server Error" });
          return;
        }
        if (viewCount !== null) {
          const newViewCount = parseInt(viewCount) + 1;
          redisClient.set(`story::${storyId}`, newViewCount);
          res.json({ viewCount: newViewCount });
          return;
        }
        const story = await Story.findByIdAndUpdate(
          storyId,
          { $inc: { view_count: 1 } },
          { new: true }
        );
        if (!story) {
          res.status(404).json({ error: "story not found" });
          return;
        }
        const newViewCount = story.view_count;
        client.set(`story:${story._id}`, newViewCount);
        res.json({ viewCount: newViewCount });
      }); 
*/
