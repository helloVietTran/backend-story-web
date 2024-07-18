const express = require("express");
const router = express.Router();
const pointController = require("../app/controllers/pointController.js");
const auth = require("../app/midleware/auth.js");

router.get("/get-point", auth, pointController.getPoint);
router.put("/attendance", auth, pointController.attendance);

module.exports = router;
