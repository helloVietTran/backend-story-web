const User = require("../models/User");
const Story = require("../models/Story");
const Comment = require("../models/Comment");

const { io } = require("../../config/socket");

class UserController {
  async update(req, res) {
    try {
      const id = req.id;
      const {
        newUserName,
        newSurName,
        sex,
        class: renameClass,
        imgSrc,
      } = req.body;
      const user = await User.findById(id);
      if (newUserName || newSurName) {
        user.name = newUserName + newSurName;
      }
      user.sex = sex || "";
      user.class = renameClass;
      if (imgSrc) {
        user.imgSrc = imgSrc;
      }
      await user.save();

      io.emit("update user", { user });
      res.status(204);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        path: "/users/update"
      });
    }
  }
  async getCurrentUser(req, res){
    try {
      const user = await User.findById(req.id);
      res.json(user);
    } catch (error) {
      console.log(error);
    }
  }

  async followStory(req, res) {
    const { storyID } = req.params;
    try {
      const userID = req.id;
      const user = await User.findById(userID);
      const story = await Story.findById(storyID);

      if (user.follow.includes(storyID)) {
        // Nếu user đã follow storyID, thì unfollow
        user.follow.pull(storyID);
        story.follower--;
      } else {
        // Nếu user chưa follow storyID, thì follow
        user.follow.push(storyID);
        story.follower++;
      }
      await Promise.all([user.save(), story.save()]);
      io.emit("follow story", {
        storyId: story._id,
        follower: story.follower,
        followStatus: user.follow,
      });
      io.emit("unfollow story", {
        storyId: story._id,
        follower: story.follower,
        followStatus: user.follow,
      });
      res.status(200).json({
        followStatus: user.follow,
      });
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }

  async followStatus(req, res) {
    try {
      const id = req.id;
      const user = await User.findById(id);
      res.json(user.follow);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
  async commentOfUser(req, res) {
    try {
      const userId = req.id;
      const comment = await Comment.find({ user: userId })
        .populate({
          path: "story",
          select: "imgSrc name",
        })
        .exec();
      res.json(comment);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
  //có thể áp dụng caching để giảm tải áp lực cơ sở dữ liệu
  // thực hiện tính toán ở client
  async topUser(req, res) {
    try {
      const user = await User.find({})
        .sort({ level: -1, process: -1 })
        .limit(10)
        .exec();
      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }
  //mark as read
  async markAsRead(req, res) {
    try {
      const user = await User.findById(req.id);
      const { storyId } = req.params;
      user.markAsRead.push(storyId);
      await user.save();
      io.emit("mark as read", { markAsRead: storyId });
      res.status(200).end();
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
  async userInfo(req, res) {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).populate({
        path: "comments",
        populate: {
          path: "story",
          select: "name url _id slug",
        },
      });
      if (!user) {
        return res.status(404).json({
          error: true,
          message: "Not found user",
        });
      }
      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
  async upgrade(req, res) {
    try {
      const id = req.id;
      const { chaptersCount } = req.params;
      const user = await User.findById(id);
      if (user.level === 1) {
        user.process += 10;
        if (user.process >= 100) {
          user.level += 1;
        }
      } else if (user.level === 2) {
        user.process += 1;
        if (user.process >= 100) {
          user.level += 1;
        }
      } else if (user.level === 3) {
        user.process += 0.1;
        if (user.process >= 100) {
          user.level += 1;
        }
      }
      user.chaptersRead += parseInt(chaptersCount);
      await user.save();

      res.status(200);
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
}
module.exports = new UserController();
