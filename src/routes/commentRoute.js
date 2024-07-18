const express = require("express");
const router = express.Router();
const commentController = require("../app/controllers/commentController");
const auth = require("../app/midleware/auth");

router.post("/create", auth, commentController.create);
router.post("/create-reply", auth, commentController.createReply);
router.get('/new-comment', commentController.newComment);
router.get("/:storyId", commentController.allComments);
router.patch("/:commentId/like", auth, commentController.likeComment);
router.patch("/:commentId/dislike", auth, commentController.dislikeComment);
router.patch("/:commentId/reply/:replyId/like", auth, commentController.likeReply);
router.patch("/:commentId/reply/:replyId/dislike", auth, commentController.dislikeReply);


module.exports = router;
