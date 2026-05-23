import express from 'express';
import {
  register, verifyOTP, resendOTP, login, googleLogin,
  refreshToken, forgotPassword, resetPassword, getMe,
} from '../controllers/auth/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { loginLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register',        register);
router.post('/verify-otp',      otpLimiter, verifyOTP);
router.post('/resend-otp',      otpLimiter, resendOTP);
router.post('/login',           loginLimiter, login);
router.post('/google',          googleLogin);
router.post('/refresh',         refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);
router.get('/me',               protect, getMe);

export default router;
