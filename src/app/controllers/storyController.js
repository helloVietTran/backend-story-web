const Story = require("../models/Story");
const User = require("../models/User");
const genreMapping = require("../../config/filter/genreMapping");
const CustomError = require("../../error/CustomError")

class StoryController {
  async stories(req, res) {
    try {
      const { queryField, page } = req.query;

      const pageNumber = page || 1;
      const storiesPerPage = 28;
      const skip = (pageNumber - 1) * storiesPerPage;

      const queryCondition = {};

      if (queryField === "hot") {
        queryCondition.hot = true;
      } else if (queryField === "girl-story") {
        queryCondition.$or = [{ gender: "female" }, { gender: "both" }];
      } else if (queryField === "boy-story") {
        queryCondition.$or = [{ gender: "male" }, { gender: "both" }];
      }

      const stories = await Story.find(queryCondition)
        .skip(skip)
        .limit(storiesPerPage)
        .populate("chapters")
        .sort({ addChapterAt: -1 })
        .exec();

      res.json(stories);

    } catch (error) {
      console.log(error);
      res.status(500).json({ error: true, message: 'Failed to get stories' });
    }
  }
  async total(req, res){
    try {
      const { queryField } = req.query;
      const queryCondition = {};
      
      if (queryField === "hot") {
        queryCondition.hot = true;
      } else if (queryField === "girl-story") {
        queryCondition.$or = [{ gender: "female" }, { gender: "both" }];//gender: -1 cho cả 2 giới
      } else if (queryField === "boy-story") {
        queryCondition.$or = [{ gender: "male" }, { gender: "both" }];
      }

      const totalStories = await Story.countDocuments(queryCondition);
      res.json(totalStories);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: true, message: 'Failed to get total stories' });
    }
  }

  async search(req, res) {
    try {
      const query = req.query.name || '';
      const regexQuery = new RegExp(query.trim().replace(/\s+/g, '.*'), 'i');
      const stories = await Story.find({ name: { $regex: regexQuery } });

      res.json(stories);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true, message: 'Failed to search stories' });
    }
  }
  
  async findByGenre(req, res) {
    try {
      const { genre, sort, status } = req.query;
      const queryCondition = {};
      const sortCondition = {};
  
      // Thiết lập điều kiện sắp xếp
      if (!sort || sort === "1") {
        sortCondition.updatedAt = 1;
      } else if (sort === "2") {
        sortCondition.createdAt = 1;
      }
  
      // Thiết lập điều kiện tìm kiếm theo thể loại
      if (genre && genre !== "Tất cả") {
        queryCondition.genres = genre;
      }
  
      // Thiết lập điều kiện tìm kiếm theo tiến độ
      if (status === "2") {
        queryCondition.status = "Đang tiến hành";
      } else if (status === "1") {
        queryCondition.status = "Đã hoàn thành";
      }
  
      // Tìm kiếm các truyện theo điều kiện và sắp xếp
      const stories = await Story.find(queryCondition)
                                  .populate("chapters")
                                  .sort(sortCondition)
                                  .exec();
      
      res.json(stories);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: true,
        message: "Fail to fetch stories by genre filter",
      });
    }
  }

  findAdvanced(req, res) {
    const { genre, notgenre, sortBy, minchapter, gender, status } = req.query;
    const queryCondition = {};
    const sortCondition = {};

    const genresArray = [];
    const notGenresArray = [];
    // thể loại
    if (genre !== "tất cả") {
      genre.split(",").map((item) => {
        genresArray.push(genreMapping[item - 1][item]);
      });
      queryCondition.$and = queryCondition.$and || [];
      queryCondition.$and.push({ genres: { $all: genresArray } });
    }
    if (notgenre !== "") {
      notgenre.split(",").map((item) => {
        notGenresArray.push(genreMapping[item - 1][item]);
      });
      queryCondition.$and = queryCondition.$and || [];
      queryCondition.$and.push({ genres: { $nin: notGenresArray } });
      console.log(queryCondition);
    }
    // số lượng chapter
    if (minchapter && sortBy !== "17") {
      let numberOfChapters;
      switch (minchapter) {
        case "50":
          numberOfChapters = 50;
          break;
        case "100":
          numberOfChapters = 100;
          break;
        case "200":
          numberOfChapters = 200;
          break;
        case "300":
          numberOfChapters = 300;
          break;
        case "400":
          numberOfChapters = 400;
          break;
        case "500":
          numberOfChapters = 500;
          break;
        default:
          break;
      }
      if (numberOfChapters) {
        queryCondition.$and = queryCondition.$and || [];
        queryCondition.$and.push({
          $expr: { $gt: [{ $size: "$chapters" }, numberOfChapters] },
        });
      }
    }

    //gender
    if (!gender) {
      queryCondition.gender = "both";//default
    } else if (gender === "1") {
      queryCondition.gender = "female";
    } else if (gender === "2") {
      queryCondition.gender = "male";
    }
    //status
    if (status === "1") {
      queryCondition.status = "Đang tiến hành";
    } else if (status === "2") {
      queryCondition.status = "Đã hoàn thành";
    }
    // sort By
    if (!sortBy) {
      sortCondition.updatedAt = 1; // default
    } else if (sortBy === "11") {
      sortCondition.view_count = 1;
    } else if (sortBy === "15") {
      sortCondition.follower = 1;
    } else if (sortBy === "16") {
      sortCondition.comment_count = 1;
    }
    Story.find(queryCondition)
      .sort(sortCondition)
      .then((stories) => res.json(stories))
      .catch((err) =>
        res.status(500).json({
          error: true,
          message: "Lỗi khi tìm kiếm nâng cao",
        })
      );
  }

  async findByStoryId(req, res, next) {
    try {
      const { storyId } = req.params;
      const story = await Story.findById(storyId);
      if (!story) {
        throw new CustomError("Story not found", 404, "/story/{storyID}}")
      }
      res.json(story);
    } catch (err) {
      next(err);
    }
  }

  // tìm truyện đã follow
  async findFollowedStory(req, res) {
    try {
      const userID = req.id;
      const user = await User.findById(userID)
        .populate({
          path: "follow",
          populate: {
            path: "chapters",
          },
        })
        .exec();

      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: true,
        message: "can not find followed story",
      });
    }
  }

  // cache
  async topStory(req, res) {
    try {
      const story = await Story.find({})
        .sort({ viewCount: -1 })
        .limit(10)
        .exec();

      res.json(story);
    } catch (error) {
      console.log(error);
      res.status(500).message({
        error: true,
        path: "/story/top-story"
      });
    }
  }

  async getUnReadStories(req, res) {
    try {
      const user = await User.findById(req.id)
        .populate({ path: "follow", populate: "chapters" })
        .exec();
      const unReadStories = user.follow;
      res.json({
        data: unReadStories,
        markAsRead: user.markAsRead,
      });
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }

  //route phía server
  create(req, res) {
    res.render("pages/create");
  }
  async store(req, res) {
    try {
      if (!req.file) {
        return res.json({
          message: "No file uploaded"
        })
      }
      const imgUrl = req.file.path;
      const data = req.body;
      delete data.file;
      data.imgSrc = imgUrl;
  
      const story = new Story(data);
      await story.save();
  
      res.redirect("back");
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: true,
        path: "/story/store"
      })
    }
  }

  async detail(req, res) {
    try {
      const id = req.params.id;
      const story = await Story.findById(id);
      if (!story) {
        return res.status(404).send("Story not found");
      }
      res.render("pages/story-detail", { story });
    } catch (err) {
      console.error(err);
      console.log("Fail in detail");
      res.status(500).send("Fail in detail");
    }
  }

  async update(req, res) {
    try {
      const data = req.body;
      const cloudUrl = req.file.path;
      data.imgSrc = cloudUrl;
      await Story.updateOne({ _id: req.params.id }, data);
      res.redirect("back");
    } catch {
      res.json({ err: "update lỗi" });
    }
  }

  edit(req, res) {
    const id = req.params.id;
    Story.findById(id)
      .then((story) => res.render("pages/edit", { story }))
      .catch(() => console.log("error in edit"));
  }

  async delete(req, res) {
    try {
      const stories = await Story.find({});
      res.render("pages/delete", { stories });
    } catch (err) {
      console.error("Error in delete page:", err);
      res.status(500).json({
        message: "Error in delete page",
        path: "/story/delete"

      });
    }
  }
  async destroy(req, res) {
    try {
      const { id } = req.params;
      // delete làm hàm của plugin soft-delete
      await Story.delete({ _id: id });
      res.redirect("back");
    } catch (err) {
      console.error("Error in destroy:", err);
      res.status(500).send("Cannot delete");
    }
  }
  
  async restore(req, res) {
    try {
      const { id } = req.params;
      await Story.restore({ _id: id });
      res.redirect("back");
    } catch (err) {
      console.error("Error in restore:", err);
      res.status(500).send("Cannot restore");
    }
  }
  
  async forceDestroy(req, res) {
    try {
      const { id } = req.params;
      await Story.deleteOne({ _id: id });
      res.redirect("back");
    } catch (err) {
      console.error("Error in forceDestroy:", err);
      res.status(500).send("Cannot delete force");
    }
  }
}
module.exports = new StoryController();
