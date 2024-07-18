const router = require('express').Router();
const errorReporter = require('../app/controllers/errorReporterController');
const auth = require("../app/midleware/auth");

router.post('/create',auth, errorReporter.create);

module.exports = router;