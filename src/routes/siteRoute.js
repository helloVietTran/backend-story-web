const express = require("express");
const router = express.Router();
const siteController = require("../app/controllers/siteController.js");

router.get("/", siteController.index);
router.get("/trash", siteController.trash);


module.exports = router;
