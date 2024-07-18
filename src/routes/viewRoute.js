const express = require("express");
const router = express.Router();
const viewController = require("../app/controllers/viewController");

router.put("/:storyId/increase", viewController.increase);

module.exports = router;
