import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code:      { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:      { type: String, enum: ['percentage', 'flat'], required: true },
  discount:  { type: Number, required: true },
  minOrder:  { type: Number, default: 0 },
  maxDiscount: { type: Number },           // cap for percentage type

  vendor:    { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // null = platform-wide
  isActive:  { type: Boolean, default: true },

  usageLimit: { type: Number, default: 1 }, // per user
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalUsed:  { type: Number, default: 0 },

  expiresAt: { type: Date, required: true },
}, {
  timestamps: true,
});

couponSchema.methods.isValid = function (userId, orderTotal) {
  if (!this.isActive) return { valid: false, reason: 'Coupon inactive' };
  if (new Date() > this.expiresAt) return { valid: false, reason: 'Coupon expired' };
  if (orderTotal < this.minOrder) return { valid: false, reason: `Minimum order ₹${this.minOrder}` };
  const usedCount = this.usedBy.filter(id => id.equals(userId)).length;
  if (usedCount >= this.usageLimit) return { valid: false, reason: 'Usage limit reached' };
  return { valid: true };
};

couponSchema.methods.computeDiscount = function (orderTotal) {
  if (this.type === 'flat') return Math.min(this.discount, orderTotal);
  const pct = (this.discount / 100) * orderTotal;
  return this.maxDiscount ? Math.min(pct, this.maxDiscount) : pct;
};

export default mongoose.model('Coupon', couponSchema);
