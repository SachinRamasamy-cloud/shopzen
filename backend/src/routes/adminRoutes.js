import express from 'express';
import {
  getDashboard, getUsers, toggleUserStatus,
  getVendors, approveVendor, rejectVendor,
  getDeliveryPartners, approveDeliveryPartner,
  getAllOrders, toggleProductStatus,
} from '../controllers/admin/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/dashboard',                    getDashboard);
router.get('/users',                        getUsers);
router.put('/users/:id/toggle',             toggleUserStatus);
router.get('/vendors',                      getVendors);
router.put('/vendors/:id/approve',          approveVendor);
router.put('/vendors/:id/reject',           rejectVendor);
router.get('/delivery',                     getDeliveryPartners);
router.put('/delivery/:id/approve',         approveDeliveryPartner);
router.get('/orders',                       getAllOrders);
router.put('/products/:id/toggle',          toggleProductStatus);

export default router;
