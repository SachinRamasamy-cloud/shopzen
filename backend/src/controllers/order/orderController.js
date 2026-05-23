import stripe from '../../config/stripe.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import Coupon from '../../models/Coupon.js';
import Vendor from '../../models/Vendor.js';
import { asyncHandler, ApiError, ApiResponse } from '../../utils/apiHelpers.js';
import { getIO } from '../../config/socket.js';
import { sendOrderConfirmationEmail } from '../../services/notifications/emailService.js';
import Notification from '../../models/Notification.js';

// ── Create Stripe Checkout Session ───────────────────────
export const createCheckout = asyncHandler(async (req, res) => {
  const { items, shippingAddress, couponCode } = req.body;
  if (!items?.length) throw new ApiError('Cart is empty', 400);

  // Fetch products and validate stock
  const productIds = items.map(i => i.product);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true })
    .populate('vendor', '_id');

  if (products.length !== items.length) throw new ApiError('Some products unavailable', 400);

  const lineItems = [];
  const orderItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = products.find(p => p._id.equals(item.product));
    if (!product) throw new ApiError(`Product not found`, 404);
    if (product.stock < item.quantity) throw new ApiError(`Insufficient stock for ${product.title}`, 400);

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      vendor:  product.vendor._id,
      title:   product.title,
      image:   product.images[0]?.url || '',
      price:   product.price,
      quantity: item.quantity,
      variant: item.variant,
    });

    lineItems.push({
      price_data: {
        currency: 'inr',
        product_data: {
          name: product.title,
          images: product.images[0]?.url ? [product.images[0].url] : [],
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    });
  }

  // Coupon
  let discount = 0;
  let coupon;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) throw new ApiError('Invalid coupon', 400);
    const validity = coupon.isValid(req.user._id, subtotal);
    if (!validity.valid) throw new ApiError(validity.reason, 400);
    discount = coupon.computeDiscount(subtotal);
  }

  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = Math.round(subtotal - discount + tax);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/orders?success=true`,
    cancel_url:  `${process.env.CLIENT_URL}/checkout?cancelled=true`,
    metadata: {
      userId:          req.user._id.toString(),
      couponCode:      couponCode || '',
      discount:        discount.toString(),
      tax:             tax.toString(),
      total:           total.toString(),
      shippingAddress: JSON.stringify(shippingAddress),
      orderItems:      JSON.stringify(orderItems),
    },
  });

  ApiResponse(res, 200, 'Checkout session created', { sessionId: session.id, url: session.url });
});

// ── Stripe Webhook ────────────────────────────────────────
export const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({ error: 'Webhook signature invalid' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await handlePaymentSuccess(session);
  }

  res.json({ received: true });
});

async function handlePaymentSuccess(session) {
  const {
    userId, couponCode, discount, tax, total,
    shippingAddress, orderItems,
  } = session.metadata;

  const items    = JSON.parse(orderItems);
  const address  = JSON.parse(shippingAddress);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  // Create order
  const order = await Order.create({
    user: userId,
    items,
    shippingAddress: address,
    subtotal,
    discount: Number(discount),
    couponCode: couponCode || undefined,
    tax: Number(tax),
    total: Number(total),
    paymentStatus: 'paid',
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent,
    trackingHistory: [{
      status: 'processing',
      message: 'Order placed and payment confirmed',
      timestamp: new Date(),
    }],
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
  });

  // Decrement stock
  await Promise.all(items.map(item =>
    Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } })
  ));

  // Mark coupon used
  if (couponCode) {
    await Coupon.findOneAndUpdate(
      { code: couponCode },
      { $push: { usedBy: userId }, $inc: { totalUsed: 1 } }
    );
  }

  // Update vendor revenue
  const vendorRevenue = {};
  items.forEach(i => {
    const vid = i.vendor.toString();
    vendorRevenue[vid] = (vendorRevenue[vid] || 0) + i.price * i.quantity;
  });
  await Promise.all(
    Object.entries(vendorRevenue).map(([vid, amount]) =>
      Vendor.findByIdAndUpdate(vid, { $inc: { revenue: amount, totalOrders: 1 } })
    )
  );

  // Clear user cart
  await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

  // Notify user
  const notification = await Notification.create({
    user: userId,
    title: 'Order Confirmed',
    message: `Your order #${order._id.toString().slice(-6).toUpperCase()} has been placed.`,
    type: 'order',
    link: `/orders/${order._id}`,
  });

  // Socket notification
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification', notification);
    io.to(`user:${userId}`).emit('orderPlaced', { orderId: order._id });

    // Notify vendors
    Object.keys(vendorRevenue).forEach(vid => {
      io.to(`vendor:${vid}`).emit('newOrder', { orderId: order._id });
    });
  } catch { /* socket may not be init */ }

  // Send confirmation email
  const user = await User.findById(userId);
  if (user?.email) {
    sendOrderConfirmationEmail(user.email, order).catch(console.error);
  }
}

// ── Get User Orders ───────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('items.product', 'title images')
      .lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);

  ApiResponse(res, 200, 'Orders', { orders, total, page: Number(page) });
});

// ── Get Single Order ──────────────────────────────────────
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('items.product', 'title images')
    .populate('deliveryPartner', 'user vehicle phone');

  if (!order) throw new ApiError('Order not found', 404);

  // Only allow: owner, admin, or the assigned delivery partner's user
  const isOwner    = order.user._id?.equals(req.user._id);
  const isAdmin    = req.user.role === 'admin';
  const isDelivery = req.user.role === 'delivery';

  if (!isOwner && !isAdmin && !isDelivery) throw new ApiError('Not authorized', 403);

  ApiResponse(res, 200, 'Order', { order });
});

// ── Update Order Status (Admin / Vendor / Delivery) ───────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message, location, coords } = req.body;

  const validStatuses = ['processing', 'packed', 'out_for_delivery', 'near_location', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) throw new ApiError('Invalid status', 400);

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError('Order not found', 404);

  order.deliveryStatus = status;
  order.trackingHistory.push({
    status,
    message: message || statusMessage(status),
    location,
    coords,
    timestamp: new Date(),
  });

  if (status === 'delivered') {
    order.deliveredAt = new Date();
  }

  await order.save();

  // Notify user via socket
  try {
    const io = getIO();
    io.to(`user:${order.user}`).emit('orderUpdated', {
      orderId: order._id,
      status,
      message: message || statusMessage(status),
    });
  } catch { /* socket may not be init */ }

  ApiResponse(res, 200, 'Order status updated', { order });
});

function statusMessage(status) {
  const map = {
    processing:       'Your order is being processed',
    packed:           'Your order has been packed',
    out_for_delivery: 'Your order is out for delivery',
    near_location:    'Your delivery partner is nearby',
    delivered:        'Your order has been delivered',
    cancelled:        'Your order has been cancelled',
  };
  return map[status] || status;
}

// ── Vendor Orders ─────────────────────────────────────────
export const getVendorOrders = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ owner: req.user._id });
  if (!vendor) throw new ApiError('Vendor not found', 404);

  const { page = 1, limit = 20, status } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { 'items.vendor': vendor._id };
  if (status) filter.deliveryStatus = status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip(skip).limit(Number(limit))
      .populate('user', 'name email').lean(),
    Order.countDocuments(filter),
  ]);

  ApiResponse(res, 200, 'Vendor orders', { orders, total });
});
