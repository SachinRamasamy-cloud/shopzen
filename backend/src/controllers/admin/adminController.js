import User from '../../models/User.js';
import Vendor from '../../models/Vendor.js';
import DeliveryPartner from '../../models/DeliveryPartner.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import { asyncHandler, ApiError, ApiResponse } from '../../utils/apiHelpers.js';

// ── Platform Dashboard ────────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalVendors, totalOrders, totalProducts,
    pendingVendors, pendingDelivery,
    revenueData, ordersPerDay,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Vendor.countDocuments({ isApproved: true }),
    Order.countDocuments({ paymentStatus: 'paid' }),
    Product.countDocuments({ isActive: true }),
    Vendor.countDocuments({ isApproved: false }),
    DeliveryPartner.countDocuments({ isApproved: false }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, orders: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  ApiResponse(res, 200, 'Admin dashboard', {
    stats: {
      totalUsers,
      totalVendors,
      totalOrders,
      totalProducts,
      platformRevenue: revenueData[0]?.total || 0,
      pendingVendors,
      pendingDelivery,
    },
    ordersPerDay,
  });
});

// ── User Management ───────────────────────────────────────
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(filter),
  ]);
  ApiResponse(res, 200, 'Users', { users, total });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError('User not found', 404);
  user.isActive = !user.isActive;
  await user.save();
  ApiResponse(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, { user });
});

// ── Vendor Approval ───────────────────────────────────────
export const getVendors = asyncHandler(async (req, res) => {
  const { approved } = req.query;
  const filter = {};
  if (approved !== undefined) filter.isApproved = approved === 'true';
  const vendors = await Vendor.find(filter).populate('owner', 'name email').sort('-createdAt').lean();
  ApiResponse(res, 200, 'Vendors', { vendors });
});

export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) throw new ApiError('Vendor not found', 404);
  vendor.isApproved = true;
  await vendor.save();
  ApiResponse(res, 200, 'Vendor approved', { vendor });
});

export const rejectVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) throw new ApiError('Vendor not found', 404);
  vendor.isApproved = false;
  vendor.isActive = false;
  await vendor.save();
  ApiResponse(res, 200, 'Vendor rejected');
});

// ── Delivery Partner Approval ─────────────────────────────
export const getDeliveryPartners = asyncHandler(async (req, res) => {
  const { approved } = req.query;
  const filter = {};
  if (approved !== undefined) filter.isApproved = approved === 'true';
  const partners = await DeliveryPartner.find(filter).populate('user', 'name email phone').lean();
  ApiResponse(res, 200, 'Delivery partners', { partners });
});

export const approveDeliveryPartner = asyncHandler(async (req, res) => {
  const partner = await DeliveryPartner.findById(req.params.id);
  if (!partner) throw new ApiError('Delivery partner not found', 404);
  partner.isApproved = true;
  await partner.save();
  ApiResponse(res, 200, 'Delivery partner approved', { partner });
});

// ── All Orders ────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, paymentStatus } = req.query;
  const filter = {};
  if (status) filter.deliveryStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip(skip).limit(Number(limit))
      .populate('user', 'name email').lean(),
    Order.countDocuments(filter),
  ]);
  ApiResponse(res, 200, 'Orders', { orders, total });
});

// ── Product Moderation ────────────────────────────────────
export const toggleProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError('Product not found', 404);
  product.isActive = !product.isActive;
  await product.save();
  ApiResponse(res, 200, `Product ${product.isActive ? 'activated' : 'deactivated'}`, { product });
});
