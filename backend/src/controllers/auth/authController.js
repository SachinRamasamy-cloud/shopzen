import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../../models/User.js';
import Vendor from '../../models/Vendor.js';
import DeliveryPartner from '../../models/DeliveryPartner.js';
import { generateTokenPair, verifyRefreshToken } from '../../utils/jwt.js';
import { generateOTP, generateResetToken, hashToken } from '../../utils/otp.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../../services/notifications/emailService.js';
import { asyncHandler, ApiError, ApiResponse } from '../../utils/apiHelpers.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Register ──────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) throw new ApiError('name, email and password are required', 400);
  if (password.length < 6) throw new ApiError('Password must be at least 6 characters', 400);

  const allowedRoles = ['user', 'vendor', 'delivery'];
  const userRole = allowedRoles.includes(role) ? role : 'user';

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError('Email already registered', 409);

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    name, email, password, role: userRole,
    otp, otpExpires,
    isEmailVerified: false,
  });

  // Create vendor/delivery profile if needed
  if (userRole === 'vendor') {
    await Vendor.create({ owner: user._id, storeName: name + "'s Store" });
  }
  if (userRole === 'delivery') {
    await DeliveryPartner.create({ user: user._id });
  }

  await sendOTPEmail(email, otp).catch(console.error);

  ApiResponse(res, 201, 'Registered. Please verify your email.', {
    userId: user._id,
    email: user.email,
  });
});

// ── Verify OTP ────────────────────────────────────────────
export const verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) throw new ApiError('userId and otp required', 400);

  const user = await User.findById(userId).select('+otp +otpExpires');
  if (!user) throw new ApiError('User not found', 404);
  if (user.otp !== otp) throw new ApiError('Invalid OTP', 400);
  if (user.otpExpires < new Date()) throw new ApiError('OTP expired', 400);

  user.isEmailVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const tokens = generateTokenPair(user);
  ApiResponse(res, 200, 'Email verified successfully', { user, ...tokens });
});

// ── Resend OTP ────────────────────────────────────────────
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select('+otp +otpExpires');
  if (!user) throw new ApiError('User not found', 404);
  if (user.isEmailVerified) throw new ApiError('Email already verified', 400);

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendOTPEmail(email, otp).catch(console.error);
  ApiResponse(res, 200, 'OTP sent');
});

// ── Login ─────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError('Email and password required', 400);

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) throw new ApiError('Invalid credentials', 401);
  if (!user.isEmailVerified) throw new ApiError('Please verify your email first', 403);
  if (!user.isActive) throw new ApiError('Account deactivated', 403);

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError('Invalid credentials', 401);

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = generateTokenPair(user);
  ApiResponse(res, 200, 'Login successful', { user, ...tokens });
});

// ── Google OAuth ──────────────────────────────────────────
export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) throw new ApiError('Google ID token required', 400);

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ $or: [{ googleId }, { email }] }).select('+googleId');

  if (!user) {
    user = await User.create({
      name, email, googleId,
      avatar: picture,
      isEmailVerified: true,
      role: 'user',
    });
  } else {
    if (!user.googleId) { user.googleId = googleId; }
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
  }

  const tokens = generateTokenPair(user);
  ApiResponse(res, 200, 'Google login successful', { user, ...tokens });
});

// ── Refresh Token ─────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) throw new ApiError('Refresh token required', 400);

  let decoded;
  try { decoded = verifyRefreshToken(token); }
  catch { throw new ApiError('Invalid or expired refresh token', 401); }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError('User not found', 401);

  const tokens = generateTokenPair(user);
  ApiResponse(res, 200, 'Tokens refreshed', tokens);
});

// ── Forgot Password ───────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError('No account with that email', 404);

  const { raw, hashed } = generateResetToken();
  user.resetToken = hashed;
  user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${raw}`;
  await sendPasswordResetEmail(email, resetUrl).catch(console.error);

  ApiResponse(res, 200, 'Password reset email sent');
});

// ── Reset Password ────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) throw new ApiError('Token and password required', 400);
  if (password.length < 6) throw new ApiError('Password must be at least 6 characters', 400);

  const hashed = hashToken(token);
  const user = await User.findOne({
    resetToken: hashed,
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) throw new ApiError('Invalid or expired reset token', 400);

  user.password = password;
  user.resetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save();

  const tokens = generateTokenPair(user);
  ApiResponse(res, 200, 'Password reset successful', tokens);
});

// ── Get Current User ──────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  ApiResponse(res, 200, 'Current user', { user: req.user });
});
