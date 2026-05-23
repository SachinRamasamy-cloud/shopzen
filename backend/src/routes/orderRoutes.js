import express from 'express';
import {
  createCheckout, stripeWebhook,
  getMyOrders, getOrder, updateOrderStatus, getVendorOrders,
} from '../controllers/order/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Webhook must use raw body — mounted before express.json() in app.js
router.post('/webhook', stripeWebhook);

router.use(protect);

router.post('/checkout',         createCheckout);
router.get('/my',                getMyOrders);
router.get('/vendor',            authorize('vendor'), getVendorOrders);
router.get('/:id',               getOrder);
router.put('/:id/status',        authorize('admin', 'vendor', 'delivery'), updateOrderStatus);

export default router;
