import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  storeName: { type: String, required: true, trim: true },
  storeSlug: { type: String, unique: true, lowercase: true },
  logo:      String,
  banner:    String,
  description: String,

  isApproved: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },

  // Commission rate (set by admin)
  commissionRate: { type: Number, default: 10 }, // percentage

  // Aggregated stats (updated by jobs)
  revenue:     { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalSold:   { type: Number, default: 0 },

  analytics: {
    revenueByMonth: [{ month: String, amount: Number }],
    topProducts:    [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, sold: Number }],
  },

  bankDetails: {
    accountHolder: String,
    accountNumber: { type: String, select: false },
    ifsc:          { type: String, select: false },
    bankName:      String,
  },

  phone:   String,
  address: String,
}, {
  timestamps: true,
});

vendorSchema.pre('save', function (next) {
  if (this.isModified('storeName')) {
    this.storeSlug = this.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

export default mongoose.model('Vendor', vendorSchema);
