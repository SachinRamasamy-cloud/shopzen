import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  vendor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor',  required: true },
  title:       String,      // snapshot at time of order
  image:       String,
  price:       { type: Number, required: true },
  quantity:    { type: Number, required: true, min: 1 },
  variant:     mongoose.Schema.Types.Mixed,
}, { _id: false });

const trackingEventSchema = new mongoose.Schema({
  status:    { type: String, required: true },
  message:   String,
  location:  String,
  coords:    { lat: Number, lng: Number },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  items:   [orderItemSchema],

  shippingAddress: {
    name:    String,
    line1:   String,
    line2:   String,
    city:    String,
    state:   String,
    country: String,
    pincode: String,
    phone:   String,
  },

  subtotal:    { type: Number, required: true },
  discount:    { type: Number, default: 0 },
  couponCode:  String,
  tax:         { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  total:       { type: Number, required: true },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod:  { type: String, default: 'stripe' },
  stripeSessionId: String,
  stripePaymentIntentId: String,

  deliveryStatus: {
    type: String,
    enum: ['processing', 'packed', 'out_for_delivery', 'near_location', 'delivered', 'cancelled'],
    default: 'processing',
  },

  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
  trackingHistory: [trackingEventSchema],

  estimatedDelivery: Date,
  deliveredAt:       Date,
}, {
  timestamps: true,
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'items.vendor': 1 });
orderSchema.index({ deliveryPartner: 1 });
orderSchema.index({ stripeSessionId: 1 });

export default mongoose.model('Order', orderSchema);
