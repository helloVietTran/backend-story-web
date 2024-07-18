const express = require("express");
const router = express.Router();
const auth = require("../app/midleware/auth.js");
const userController = require("../app/controllers/userController");

router.get("/follow-status", auth, userController.followStatus);
router.get("/top-user", userController.topUser);// ok
router.put("/update", auth, userController.update);//ok
router.get("/current-user",auth, userController.getCurrentUser);
router.get("/comment-of-user", auth, userController.commentOfUser);
router.get("/:userId", userController.userInfo);
router.patch("/follow-story/:storyID", auth, userController.followStory);
router.patch("/mark-as-read/:storyId", auth, userController.markAsRead);
router.patch("/upgrade/:chaptersCount", auth, userController.upgrade)

module.exports = router;
