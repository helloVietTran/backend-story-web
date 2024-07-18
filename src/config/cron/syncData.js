const redisClient = require("../db/init.redis");
const Story = require("../../app/models/Story");
const Chapter = require("../../app/models/Chapter");

function getAsync(key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        });
    });
}

async function syncData() {
  try {
    const getStoryKeys = await new Promise((resolve, reject) => {
      redisClient.keys("story*", function (error, storyKeys) {
        if (error) {
          reject(error);
          return;
        }
        resolve(storyKeys);
      });
    });
    const getChapterKeys = await new Promise((resolve, reject) => {
        redisClient.keys("chapter*", function (error, chapterKeys) {
          if (error) {
            reject(error);
            return;
          }
          resolve(chapterKeys);
        });
      });
    const [storyKeys, chapterKeys] = await Promise.all([getStoryKeys, getChapterKeys]);
    for(key of storyKeys){
        const viewCount = await getAsync(key);
        const storyId = key.split('::')[1];
        await Story.findByIdAndUpdate(storyId, {$set: {view_count: viewCount}})
    }
    for(key of chapterKeys){
        const viewCount = await getAsync(key);
        const chapterId = key.split('::')[1];
        await Chapter.findByIdAndUpdate(chapterId, {$set: {view_count: viewCount}})
    }
    

  } catch (error) {
    console.log(error);
    console.log("cant not sync data");
  }
}
module.exports= syncData;
