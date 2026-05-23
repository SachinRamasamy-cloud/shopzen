import express from 'express';
import DeliveryPartner from '../models/DeliveryPartner.js';
import Order from '../models/Order.js';
import { asyncHandler, ApiError, ApiResponse } from '../utils/apiHelpers.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { getIO } from '../config/socket.js';

const getPartnerOrFail = async (userId) => {
  const partner = await DeliveryPartner.findOne({ user: userId });
  if (!partner || !partner.isApproved) throw new ApiError('Delivery partner not found or not approved', 404);
  return partner;
};

// ── Dashboard ─────────────────────────────────────────────
const getDashboard = asyncHandler(async (req, res) => {
  const partner = await getPartnerOrFail(req.user._id);
  const [assignedOrders, recentDeliveries] = await Promise.all([
    Order.find({ deliveryPartner: partner._id, deliveryStatus: { $in: ['out_for_delivery', 'near_location'] } })
      .populate('user', 'name').lean(),
    Order.find({ deliveryPartner: partner._id, deliveryStatus: 'delivered' })
      .sort('-deliveredAt').limit(10).lean(),
  ]);
  ApiResponse(res, 200, 'Delivery dashboard', {
    partner,
    stats: { totalDeliveries: partner.totalDeliveries, totalEarnings: partner.totalEarnings },
    assignedOrders,
    recentDeliveries,
  });
});

// ── Toggle Online Status ──────────────────────────────────
const toggleOnline = asyncHandler(async (req, res) => {
  const partner = await getPartnerOrFail(req.user._id);
  partner.isOnline = !partner.isOnline;
  await partner.save();
  ApiResponse(res, 200, `Now ${partner.isOnline ? 'online' : 'offline'}`, { isOnline: partner.isOnline });
});

// ── Accept Order ──────────────────────────────────────────
const acceptOrder = asyncHandler(async (req, res) => {
  const partner = await getPartnerOrFail(req.user._id);
  if (partner.activeOrder) throw new ApiError('Complete current delivery first', 400);

  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError('Order not found', 404);
  if (order.deliveryPartner) throw new ApiError('Order already assigned', 400);

  order.deliveryPartner = partner._id;
  order.deliveryStatus = 'out_for_delivery';
  order.trackingHistory.push({
    status: 'out_for_delivery',
    message: 'Delivery partner has picked up your order',
    timestamp: new Date(),
  });
  await order.save();

  partner.activeOrder = order._id;
  await partner.save();

  try {
    getIO().to(`user:${order.user}`).emit('orderUpdated', {
      orderId: order._id, status: 'out_for_delivery',
    });
  } catch {}

  ApiResponse(res, 200, 'Order accepted', { order });
});

// ── Update Location (simulated GPS) ──────────────────────
const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng, orderId } = req.body;
  const partner = await getPartnerOrFail(req.user._id);

  partner.currentLocation = { lat, lng, updatedAt: new Date() };
  await partner.save();

  if (orderId) {
    try {
      const order = await Order.findById(orderId);
      if (order) {
        getIO().to(`user:${order.user}`).emit('deliveryLocation', { lat, lng, orderId });
      }
    } catch {}
  }

  ApiResponse(res, 200, 'Location updated');
});

// ── Complete Delivery ─────────────────────────────────────
const completeDelivery = asyncHandler(async (req, res) => {
  const partner = await getPartnerOrFail(req.user._id);
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new ApiError('Order not found', 404);
  if (!order.deliveryPartner?.equals(partner._id)) throw new ApiError('Not your order', 403);

  order.deliveryStatus = 'delivered';
  order.deliveredAt = new Date();
  order.trackingHistory.push({
    status: 'delivered', message: 'Order delivered successfully', timestamp: new Date(),
  });
  await order.save();

  partner.activeOrder = undefined;
  partner.totalDeliveries += 1;
  partner.totalEarnings += 50; // flat delivery fee per order
  await partner.save();

  try {
    getIO().to(`user:${order.user}`).emit('orderUpdated', { orderId: order._id, status: 'delivered' });
  } catch {}

  ApiResponse(res, 200, 'Delivery completed');
});

const router = express.Router();
router.use(protect, authorize('delivery'));

router.get('/dashboard',                  getDashboard);
router.put('/toggle-online',              toggleOnline);
router.put('/orders/:orderId/accept',     acceptOrder);
router.put('/location',                   updateLocation);
router.put('/orders/:orderId/complete',   completeDelivery);

export default router;
