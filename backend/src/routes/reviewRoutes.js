import express from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/apiHelpers.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload, uploadToCloud } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true })
      .sort('-createdAt').skip(skip).limit(Number(limit))
      .populate('user', 'name avatar').lean(),
    Review.countDocuments({ product: req.params.productId, isApproved: true }),
  ]);
  ApiResponse(res, 200, 'Reviews', { reviews, total });
}));

// Create review
router.post('/', protect, upload.array('images', 4), uploadToCloud('reviews'), asyncHandler(async (req, res) => {
  const { product, rating, title, body, orderId } = req.body;

  const existing = await Review.findOne({ user: req.user._id, product });
  if (existing) throw new ApiError('Already reviewed this product', 409);

  // Check verified purchase
  let verifiedPurchase = false;
  if (orderId) {
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      'items.product': product,
      paymentStatus: 'paid',
    });
    verifiedPurchase = !!order;
  }

  const review = await Review.create({
    user: req.user._id,
    product,
    order: orderId,
    rating: Number(rating),
    title,
    body,
    images: req.uploadedImages || [],
    verifiedPurchase,
  });

  ApiResponse(res, 201, 'Review submitted', { review });
}));

// Delete review (owner or admin)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError('Review not found', 404);
  if (!review.user.equals(req.user._id) && req.user.role !== 'admin') {
    throw new ApiError('Not authorized', 403);
  }
  await review.deleteOne();
  ApiResponse(res, 200, 'Review deleted');
}));

export default router;
