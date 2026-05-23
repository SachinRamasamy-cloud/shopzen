import express from 'express';
import {
  getProfile, updateProfile, getDashboard,
  getVendorProducts, getCoupons, createCoupon, deleteCoupon, updateStock,
} from '../controllers/vendor/vendorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { upload, uploadToCloud } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect, authorize('vendor', 'admin'));

router.get('/profile',   getProfile);
router.put('/profile',   upload.single('logo'), uploadToCloud('vendors'), updateProfile);
router.get('/dashboard', getDashboard);
router.get('/products',  getVendorProducts);

router.put('/products/:id/stock', updateStock);

router.get('/coupons',       getCoupons);
router.post('/coupons',      createCoupon);
router.delete('/coupons/:id', deleteCoupon);

export default router;
