import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  line1:    { type: String, required: true },
  line2:    String,
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  country:  { type: String, required: true },
  pincode:  { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const cartItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  variant:  { type: mongoose.Schema.Types.Mixed },  // selected variant (size, color…)
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false },

  role: {
    type: String,
    enum: ['user', 'vendor', 'delivery', 'admin'],
    default: 'user',
  },

  avatar:        { type: String, default: '' },
  googleId:      { type: String, select: false },
  isEmailVerified: { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },

  addresses: [addressSchema],
  cart:      [cartItemSchema],
  wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // OTP
  otp:          { type: String, select: false },
  otpExpires:   { type: Date, select: false },

  // Password reset
  resetToken:        { type: String, select: false },
  resetTokenExpires: { type: Date, select: false },

  lastLogin: Date,
}, {
  timestamps: true,
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleId;
  delete obj.otp;
  delete obj.otpExpires;
  delete obj.resetToken;
  delete obj.resetTokenExpires;
  return obj;
};

export default mongoose.model('User', userSchema);
