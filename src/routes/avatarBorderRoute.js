const router = require('express').Router();
const avatarBorderController = require('../app/controllers/avatarBorderController');
const  fileUploader = require('../config/cloudinary/upload.js');
const auth = require('../app/midleware/auth.js');

router.get('/create', avatarBorderController.create);
router.post('/store', fileUploader.single('file'),avatarBorderController.store);
router.get('/get-all', fileUploader.single('file'),avatarBorderController.allAvatarBorder);
router.patch('/buy/:avatarBorderId',auth, avatarBorderController.buyAvatarBorder);


module.exports = router;