import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, trim: true },
  body:    { type: String, trim: true },
  images:  [{ url: String, publicId: String }],

  verifiedPurchase: { type: Boolean, default: false },
  isApproved:       { type: Boolean, default: true },

  // AI generated summary field (used for batch summarization)
  helpful: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });

// Update product rating on save/delete
reviewSchema.post('save', updateProductRating);
reviewSchema.post('deleteOne', { document: true }, updateProductRating);

async function updateProductRating(doc) {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: doc.product, isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Product.findByIdAndUpdate(doc.product, {
      ratingsAvg:   Math.round(stats[0].avg * 10) / 10,
      ratingsCount: stats[0].count,
    });
  }
}

export default mongoose.model('Review', reviewSchema);
