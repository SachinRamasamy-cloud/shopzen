import rateLimit from 'express-rate-limit';

const make = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) =>
      res.status(429).json({ success: false, message: options.message || 'Too many requests' }),
    ...options,
  });

export const loginLimiter = make({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: 'Too many login attempts. Try again in 15 minutes.',
});

export const otpLimiter = make({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 3,
  message: 'Too many OTP requests. Try again in 10 minutes.',
});

export const apiLimiter = make({
  windowMs: 60 * 1000, // 1 min
  max: 100,
  message: 'Too many requests. Slow down.',
});

export const strictLimiter = make({
  windowMs: 60 * 1000,
  max: 20,
});
