import { verifyAccessToken } from '../utils/jwt.js';
import { asyncHandler, ApiError } from '../utils/apiHelpers.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) throw new ApiError('Not authenticated', 401);

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch {
    throw new ApiError('Invalid or expired token', 401);
  }

  const user = await User.findById(decoded.id).select('+isActive');
  if (!user || !user.isActive) throw new ApiError('User not found or deactivated', 401);

  req.user = user;
  next();
});
