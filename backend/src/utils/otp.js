import crypto from 'crypto';

export const generateOTP = (length = 6) =>
  Math.floor(10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1)).toString();

export const generateResetToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
};

export const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');
