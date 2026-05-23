import express from 'express';
import {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, getCategories,
} from '../controllers/product/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { upload, uploadToCloud } from '../middleware/uploadMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(apiLimiter);

router.get('/',            getProducts);
router.get('/categories',  getCategories);
router.get('/:id',         getProduct);

router.post(
  '/',
  protect,
  authorize('vendor', 'admin'),
  upload.array('images', 10),
  uploadToCloud('products'),
  createProduct,
);

router.put(
  '/:id',
  protect,
  authorize('vendor', 'admin'),
  upload.array('images', 10),
  uploadToCloud('products'),
  updateProduct,
);

router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

export default router;
