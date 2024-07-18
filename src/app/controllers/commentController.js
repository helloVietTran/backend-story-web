const mongoose = require("mongoose");

const Comment = require("../../app/models/Comment");
const User = require("../../app/models/User");
const Story = require("../../app/models/Story");
const Reply = require("../../app/models/Reply");

const { io } = require("../../config/socket");
const CustomError = require("../../error/CustomError");

class CommentController {

  async create(req, res) {
    try {
      const userId = req.id;
      const { storyId, content, chap } = req.body;
      //const user = await User.findById(userId);
      //user.comments.push(comment._id);
     // await user.save();
      await Story.findByIdAndUpdate(storyId, { $inc: { commentCount: 1 } });

      const comment = await Comment.create({
        user: userId,
        content: content,
        story: storyId,
        atChapter: chap || "",
      });
      const user = await User.findByIdAndUpdate(userId, { $push: { comments: comment._id } });
      
      const newComment = await Comment.findById(comment._id) 
        .populate({
          path: "user",
          select: "name level process frame _id",
        })
        .populate({
          path: "story",
          select: "name _id slug",
        })
        .exec();

      
      io.emit("new comment", { newComment: newComment });
      res.status(200).end();
    } catch (error) {
      console.log(error);
    }
  }

  async createReply(req, res) {
    try {
      const id = req.id;
      const { content, replyTo, commentId } = req.body;
      const reply = new Reply({
        user: id,
        content,
        replyTo,
      });
      await Comment.findByIdAndUpdate(
        commentId,
        { $push: { replies: reply._id } },
        { new: true }// trả về phần tử sau update
      )
      await reply.save();

      const newReply = await Reply.findById(reply._id)
      .populate({
        path: "user",
        select: "name level process frame _id",
      })

      io.emit("new reply", { newReply: newReply, commentId });

      res.status(200);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: error.message,
        path: "/comment/create-reply"
      });
    }
  }

  
  async allComments(req, res) {
    const { storyId } = req.params;
    try {
      const comments = await Comment.find({
        story: new mongoose.Types.ObjectId(storyId),
      })
        .populate({
          path: "replies",
          populate: {
            path: "user",
            select: "name level process imgSrc frame",
            populate: {
              path: "frame",
              select: "imgSrc"
            }
          },
        })
        .populate({
          path: "user",
          select: "name level process imgSrc frame", 
          populate:{
            path: "frame",
            select: "imgSrc"
          }
        })
        .exec();

      res.json(comments);

    } catch (error) {
      console.log(error);
      res.end();
    }
  }

  //like
  async likeComment(req, res, next) {
    try {
      const { commentId } = req.params;
      const userId = req.id;
      
      const comment = await Comment.findById(commentId);
      if(!comment){
        throw new CustomError("Like comment failed", 500, "/comments/:commentId/like")
      }

      const userHasLikeIndex = comment.likedBy.indexOf(userId);
      const userHasDisLikeIndex = comment.dislikedBy.indexOf(userId);

      // chưa like và chưa dislike
      if (userHasLikeIndex === -1 && userHasDisLikeIndex === -1) {    
        comment.likedBy.push(userId);
        comment.likeCount++;
      } 
      // đang dislike
      else if (userHasDisLikeIndex !== -1 && userHasLikeIndex === -1) { 
        comment.dislikedBy.splice(userHasDisLikeIndex, 1);
        comment.dislikeCount--;
        comment.likedBy.push(userId);
        comment.likeCount++;
      } 
      // đang like
      else if (userHasLikeIndex !== -1 && userHasDisLikeIndex === -1) {       
        comment.likedBy.splice(userHasLikeIndex, 1);
        comment.likeCount--;
      }

      await comment.save();

      io.emit("react comment", {
        commentId: comment._id,
        likeCount: comment.likeCount,
        dislikeCount: comment.dislikeCount,
      });

      res.status(200).json({
        message: "like succcessfully",
      });
    } catch (error) {
      next(error);
    }
  }
  //dislike
  async dislikeComment(req, res) {
    try {
      const { commentId } = req.params;
      const userId = req.id; //id người dùng;
      const comment = await Comment.findById(commentId);

      const userHasLikeIndex = comment.likedBy.indexOf(userId);
      const userHasDisLikeIndex = comment.dislikedBy.indexOf(userId);

      if (userHasLikeIndex === -1 && userHasDisLikeIndex === -1) {
        // chưa like và chưa dislike
        comment.dislikedBy.push(userId);
        comment.dislikeCount++;
      } else if (userHasDisLikeIndex === -1 && userHasLikeIndex !== -1) {
        // đang like
        comment.likedBy.splice(userHasLikeIndex, 1);
        comment.likeCount--;
        comment.dislikedBy.push(userId);
        comment.dislikeCount++;
      } else if (userHasLikeIndex === -1 && userHasDisLikeIndex !== -1) {
        // đang dislike
        comment.dislikedBy.splice(userHasLikeIndex, 1);
        comment.dislikeCount--;
      }
      await comment.save();

      io.emit("react comment", {
        commentId: commentId,
        dislikeCount: comment.dislikeCount,
        likeCount: comment.likeCount,
      });

      res.status(200).json({
        message: "dislike succcessfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("internal server error");
    }
  }

  //like reply
  async likeReply(req, res) {
    try {
      const { replyId, commentId } = req.params;
      const userId = req.id;

      const reply = await Reply.findById(replyId);

      const userHasLikeIndex = reply.likedBy.indexOf(userId);
      const userHasDisLikeIndex = reply.dislikedBy.indexOf(userId);
 
      if (userHasLikeIndex === -1 && userHasDisLikeIndex === -1) {
        // chưa like và chưa dislike
        reply.likedBy.push(userId);
        reply.likeCount++;
      }
      // đang dislike
      else if (userHasDisLikeIndex !== -1 && userHasLikeIndex === -1) {
        
        reply.dislikedBy.splice(userHasDisLikeIndex, 1);
        reply.dislikeCount--;
        reply.likedBy.push(userId);
        reply.likeCount++;
      }
      // đang like 
      else if (userHasLikeIndex !== -1 && userHasDisLikeIndex === -1) {
        reply.likedBy.splice(userHasLikeIndex, 1);
        reply.likeCount--;
      }
      await reply.save();

      io.emit("react reply", {
        replyId: replyId,
        commentId,
        dislikeCount: reply.dislikeCount,
        likeCount: reply.likeCount,
      });

      res.status(200).json({
        message: "like succcessfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("internal server error");
    }
  }

  //dislike reply
  async dislikeReply(req, res) {
    try {
    
      const { replyId, commentId } = req.params;
      const userId = req.id; //id người dùng;
      const reply = await Reply.findById(replyId);

      const userHasLikeIndex = reply.likedBy.indexOf(userId);
      const userHasDisLikeIndex = reply.dislikedBy.indexOf(userId);
       // chưa like và chưa dislike
      if (userHasLikeIndex === -1 && userHasDisLikeIndex === -1) {
        reply.dislikedBy.push(userId);
        reply.dislikeCount++;
      } 
      // đang like
      else if (userHasDisLikeIndex === -1 && userHasLikeIndex !== -1) {
        
        reply.likedBy.splice(userHasLikeIndex, 1);
        reply.likeCount--;
        reply.dislikedBy.push(userId);
        reply.dislikeCount++;
      } 
      // đang dislike
      else if (userHasLikeIndex === -1 && userHasDisLikeIndex !== -1) {
        
        reply.dislikedBy.splice(userHasLikeIndex, 1);
        reply.dislikeCount--;
      }
      await reply.save();
      
      io.emit("react reply", {
        replyId: replyId,
        dislikeCount: reply.dislikeCount,
        likeCount: reply.likeCount,
        commentId,
      });

      res.status(200).json({
        message: "dislike succcessfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json("internal server error");
    }
  }


  async newComment(req, res) {
    try {
      const comment = await Comment.find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .populate({
          path: "story",
          select: '_id name slug'
        })
        .populate({
          path: "user",
          select: "_id name avatar",
        })
        .exec();

      res.json(comment);
    } catch (error) {
      res.status(500).json({
        message: "New comment error",
        path: "/comments/new-comment"
      });
    }
  }
}
module.exports = new CommentController();
