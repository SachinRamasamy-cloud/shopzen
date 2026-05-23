import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  name:  { type: String, required: true },  // e.g. "Color", "Size"
  value: { type: String, required: true },  // e.g. "Red", "XL"
  sku:   { type: String, required: true },
  price: { type: Number },                  // override base price if set
  stock: { type: Number, default: 0 },
}, { _id: true });

const productSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  slug:        { type: String, unique: true, lowercase: true },

  category:    { type: String, required: true },
  subCategory: { type: String },
  tags:        [String],

  price:       { type: Number, required: true, min: 0 },
  comparePrice: { type: Number },           // original price for strike-through
  discount:    { type: Number, default: 0 },// percentage

  images:  [{ url: String, publicId: String }],
  vendor:  { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },

  variants:    [variantSchema],
  stock:       { type: Number, required: true, default: 0 },
  sku:         { type: String },

  isActive:    { type: Boolean, default: true },
  isFeatured:  { type: Boolean, default: false },

  // Denormalized rating info (updated on review write)
  ratingsAvg:   { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },

  // AI
  embeddingVector: { type: [Number], select: false },
}, {
  timestamps: true,
});

// Auto-generate slug from title
productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ price: 1 });

export default mongoose.model('Product', productSchema);
