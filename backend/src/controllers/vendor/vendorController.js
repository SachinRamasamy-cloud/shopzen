import Vendor from '../../models/Vendor.js';
import Product from '../../models/Product.js';
import Order from '../../models/Order.js';
import Coupon from '../../models/Coupon.js';
import User from '../../models/User.js';
import { asyncHandler, ApiError, ApiResponse } from '../../utils/apiHelpers.js';

const getVendorOrFail = async (userId) => {
  const vendor = await Vendor.findOne({ owner: userId });
  if (!vendor) throw new ApiError('Vendor profile not found', 404);
  return vendor;
};

// ── Vendor Profile ────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ owner: req.user._id }).populate('owner', 'name email avatar');
  if (!vendor) throw new ApiError('Vendor not found', 404);
  ApiResponse(res, 200, 'Vendor profile', { vendor });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const vendor = await getVendorOrFail(req.user._id);
  const { storeName, description, phone, address } = req.body;
  if (storeName) vendor.storeName = storeName;
  if (description) vendor.description = description;
  if (phone) vendor.phone = phone;
  if (address) vendor.address = address;
  if (req.uploadedImages?.[0]) vendor.logo = req.uploadedImages[0].url;
  await vendor.save();
  ApiResponse(res, 200, 'Profile updated', { vendor });
});

// ── Dashboard Analytics ───────────────────────────────────
export const getDashboard = asyncHandler(async (req, res) => {
  const vendor = await getVendorOrFail(req.user._id);

  const [
    totalProducts,
    activeProducts,
    pendingOrders,
    recentOrders,
    lowStockProducts,
    revenueByMonth,
  ] = await Promise.all([
    Product.countDocuments({ vendor: vendor._id }),
    Product.countDocuments({ vendor: vendor._id, isActive: true }),
    Order.countDocuments({ 'items.vendor': vendor._id, deliveryStatus: 'processing' }),
    Order.find({ 'items.vendor': vendor._id })
      .sort('-createdAt').limit(5)
      .populate('user', 'name email').lean(),
    Product.find({ vendor: vendor._id, isActive: true, stock: { $lte: 5 } })
      .select('title stock').lean(),
    Order.aggregate([
      { $match: { 'items.vendor': vendor._id, paymentStatus: 'paid' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        revenue: { $sum: '$total' },
        orders:  { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),
  ]);

  ApiResponse(res, 200, 'Vendor dashboard', {
    stats: {
      revenue: vendor.revenue,
      totalOrders: vendor.totalOrders,
      totalProducts,
      activeProducts,
      pendingOrders,
    },
    recentOrders,
    lowStockProducts,
    revenueByMonth,
  });
});

// ── Vendor Products ───────────────────────────────────────
export const getVendorProducts = asyncHandler(async (req, res) => {
  const vendor = await getVendorOrFail(req.user._id);
  const { page = 1, limit = 20, search } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { vendor: vendor._id };
  if (search) filter.$text = { $search: search };

  const [products, total] = await Promise.all([
    Product.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).lean(),
    Product.countDocuments(filter),
  ]);

  ApiResponse(res, 200, 'Vendor products', { products, total });
});

// ── Coupons ───────────────────────────────────────────────
export const getCoupons = asyncHandler(async (req, res) => {
  const vendor = await getVendorOrFail(req.user._id);
  const coupons = await Coupon.find({ vendor: vendor._id }).sort('-createdAt').lean();
  ApiResponse(res, 200, 'Coupons', { coupons });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const vendor = await getVendorOrFail(req.user._id);
  const { code, type, discount, minOrder, maxDiscount, usageLimit, expiresAt } = req.body;

  const coupon = await Coupon.create({
    code, type, discount, minOrder, maxDiscount, usageLimit, expiresAt,
    vendor: vendor._id,
  });

  ApiResponse(res, 201, 'Coupon created', { coupon });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const vendor = await getVendorOrFail(req.user._id);
  const coupon = await Coupon.findOne({ _id: req.params.id, vendor: vendor._id });
  if (!coupon) throw new ApiError('Coupon not found', 404);
  await coupon.deleteOne();
  ApiResponse(res, 200, 'Coupon deleted');
});

// ── Inventory Update ──────────────────────────────────────
export const updateStock = asyncHandler(async (req, res) => {
  const vendor = await getVendorOrFail(req.user._id);
  const { stock } = req.body;
  const product = await Product.findOne({ _id: req.params.id, vendor: vendor._id });
  if (!product) throw new ApiError('Product not found', 404);
  product.stock = Number(stock);
  await product.save();
  ApiResponse(res, 200, 'Stock updated', { product });
});
