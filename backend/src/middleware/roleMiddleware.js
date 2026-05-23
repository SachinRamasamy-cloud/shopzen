import { ApiError } from '../utils/apiHelpers.js';

// Usage: authorize('admin'), authorize('vendor', 'admin')
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError('Not authenticated', 401));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(`Role '${req.user.role}' is not allowed to access this resource`, 403));
  }
  next();
};
