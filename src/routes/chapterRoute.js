const express = require('express');
const router = express.Router();
const chapterController = require('../app/controllers/chapterController.js');
const  fileUploader = require('../config/cloudinary/upload.js');

router.get('/:storyId', chapterController.index);
router.get('/:id/create', chapterController.create);
router.post('/:storyId/store',fileUploader.array('files'), chapterController.store);
router.get('/:id/edit', chapterController.edit);
router.put('/:id/update',fileUploader.array('files'),chapterController.update);

module.exports = router;