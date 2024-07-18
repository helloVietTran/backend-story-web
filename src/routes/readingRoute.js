const router = require('express').Router();
const readingController = require('../app/controllers/readingController');
const auth = require('../app/midleware/auth')

router.get('/', auth, readingController.index);
router.put('/add-story', auth, readingController.addStory);
router.patch('/delete-story/:id', auth, readingController.deleteStory);

module.exports = router;