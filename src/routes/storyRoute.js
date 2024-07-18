const express = require('express')
const router = express.Router()
const storyController = require('../app/controllers/storyController.js');
const  fileUploader = require('../config/cloudinary/upload.js');// middleware
const auth = require('../app/midleware/auth.js');


router.get('/', storyController.stories)// fe 
router.get('/total', storyController.total)//fe
router.get('/search', storyController.search)//fe
router.get('/genres', storyController.findByGenre)//fe
router.get('/find-advanced', storyController.findAdvanced)//fe;
router.get('/followed-story',auth, storyController.findFollowedStory)//fe // có thể trảm
router.get('/create',storyController.create)
router.post('/store', fileUploader.single('file'),storyController.store);
router.get('/delete', storyController.delete);
router.get('/top-story', storyController.topStory);// fe

router.get('/:storyId', storyController.findByStoryId);//fe
router.get('/:id/edit',storyController.edit)
router.put('/:id/update',fileUploader.single('file'), storyController.update);
router.delete('/:id/delete', storyController.destroy)
router.delete('/:id/delete/force', storyController.forceDestroy)
router.patch('/:id/restore', storyController.restore)
router.get('/:id/stories-detail', storyController.detail);

module.exports = router