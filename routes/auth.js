

const router = require('express').Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { ensureAuthenticated, ensureGuest } = require('../middleware/authMiddleware');


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});




router.get('/register', ensureGuest, authController.getRegister);
router.post('/register', ensureGuest, authLimiter, authController.postRegister);


router.get('/verify', ensureGuest, authController.getVerify);
router.post('/verify', ensureGuest, authLimiter, authController.postVerify);
router.post('/resend-otp', ensureGuest, authLimiter, authController.postResendOtp);


router.get('/login', ensureGuest, authController.getLogin);
router.post('/login', ensureGuest, authLimiter, authController.postLogin);
router.get('/logout', ensureAuthenticated, authController.getLogout);


router.get('/google', ensureGuest, passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/auth/login',
    failureFlash: true
}), authController.googleCallback);


router.get('/forgot-password', ensureGuest, authController.getForgotPassword);
router.post('/forgot-password', ensureGuest, authLimiter, authController.postForgotPassword);
router.get('/reset/:token', ensureGuest, authController.getResetPassword);
router.post('/reset/:token', ensureGuest, authLimiter, authController.postResetPassword);

module.exports = router;