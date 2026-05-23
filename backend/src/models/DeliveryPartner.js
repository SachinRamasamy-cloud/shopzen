import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  isApproved: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  isOnline:   { type: Boolean, default: false },

  vehicle:    { type: String, enum: ['bike', 'scooter', 'car', 'van'], default: 'bike' },
  licensePlate: String,

  // Live location (updated via socket)
  currentLocation: {
    lat: Number,
    lng: Number,
    updatedAt: Date,
  },

  // Current active order
  activeOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

  // Earnings
  totalEarnings:  { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },

  rating: { type: Number, default: 0 },

  phone:   String,
  address: String,
}, {
  timestamps: true,
});

export default mongoose.model('DeliveryPartner', deliveryPartnerSchema);
