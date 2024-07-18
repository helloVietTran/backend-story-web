const router = require('express').Router();
const authController = require('../app/controllers/authController');
const auth = require('../app/midleware/auth')

router.get('/auto-login', auth, authController.autoLogin);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/resend-otp",auth, authController.resendOTP);
router.post("/logout", auth, authController.logout);
router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.patch("/change-password", authController.changePassword);

module.exports = router;