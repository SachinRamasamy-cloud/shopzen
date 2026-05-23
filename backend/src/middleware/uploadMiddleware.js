import multer from 'multer';
import { uploadBuffer } from '../config/cloudinary.js';
import { ApiError } from '../utils/apiHelpers.js';

// Store in memory for Cloudinary streaming
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError('Only image files are allowed', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Middleware to push uploaded files to Cloudinary
export const uploadToCloud = (folder) => async (req, res, next) => {
  try {
    if (!req.files?.length && !req.file) return next();

    const files = req.files?.length ? req.files : [req.file];
    const results = await Promise.all(
      files.map(f => uploadBuffer(f.buffer, folder))
    );

    req.uploadedImages = results;
    next();
  } catch (err) {
    next(err);
  }
};
