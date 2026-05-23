import Product from '../../models/Product.js';
import Vendor from '../../models/Vendor.js';
import { asyncHandler, ApiError, ApiResponse } from '../../utils/apiHelpers.js';
import { cacheGet, cacheSet, cacheDel, cacheDelPattern } from '../../config/redis.js';

// ── List / Search Products ────────────────────────────────
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category, search, minPrice, maxPrice,
    sort = '-createdAt', page = 1, limit = 20,
    vendor, featured,
  } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (vendor)   filter.vendor   = vendor;
  if (featured) filter.isFeatured = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$text = { $search: search };
  }

  const cacheKey = `products:${JSON.stringify({ filter, sort, page, limit })}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse(res, 200, 'Products (cached)', cached);

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('vendor', 'storeName storeSlug logo')
      .lean(),
    Product.countDocuments(filter),
  ]);

  const data = { products, total, page: Number(page), pages: Math.ceil(total / limit) };
  await cacheSet(cacheKey, data, 120);
  ApiResponse(res, 200, 'Products', data);
});

// ── Single Product ────────────────────────────────────────
export const getProduct = asyncHandler(async (req, res) => {
  const cacheKey = `product:${req.params.id}`;
  const cached = await cacheGet(cacheKey);
  if (cached) return ApiResponse(res, 200, 'Product (cached)', { product: cached });

  const product = await Product.findById(req.params.id)
    .populate('vendor', 'storeName storeSlug logo rating')
    .lean();
  if (!product || !product.isActive) throw new ApiError('Product not found', 404);

  await cacheSet(cacheKey, product, 300);
  ApiResponse(res, 200, 'Product', { product });
});

// ── Create Product (Vendor) ───────────────────────────────
export const createProduct = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ owner: req.user._id });
  if (!vendor) throw new ApiError('Vendor profile not found', 404);
  if (!vendor.isApproved) throw new ApiError('Vendor not approved yet', 403);

  const { title, description, category, price, comparePrice, stock, variants, tags, subCategory } = req.body;

  const images = req.uploadedImages || [];
  const product = await Product.create({
    title, description, category, subCategory, tags,
    price: Number(price),
    comparePrice: comparePrice ? Number(comparePrice) : undefined,
    stock: Number(stock),
    variants: variants ? JSON.parse(variants) : [],
    images,
    vendor: vendor._id,
  });

  await cacheDelPattern('products:*');
  ApiResponse(res, 201, 'Product created', { product });
});

// ── Update Product (Vendor) ───────────────────────────────
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError('Product not found', 404);

  const vendor = await Vendor.findOne({ owner: req.user._id });
  if (!vendor || !product.vendor.equals(vendor._id)) {
    if (req.user.role !== 'admin') throw new ApiError('Not authorized', 403);
  }

  const updates = { ...req.body };
  if (req.uploadedImages?.length) {
    updates.images = [...product.images, ...req.uploadedImages];
  }
  if (updates.variants) updates.variants = JSON.parse(updates.variants);

  const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });

  await cacheDel(`product:${req.params.id}`);
  await cacheDelPattern('products:*');
  ApiResponse(res, 200, 'Product updated', { product: updated });
});

// ── Delete Product (Vendor / Admin) ──────────────────────
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError('Product not found', 404);

  if (req.user.role !== 'admin') {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor || !product.vendor.equals(vendor._id)) throw new ApiError('Not authorized', 403);
  }

  // Soft delete
  product.isActive = false;
  await product.save();

  await cacheDel(`product:${req.params.id}`);
  await cacheDelPattern('products:*');
  ApiResponse(res, 200, 'Product deleted');
});

// ── Get Categories ────────────────────────────────────────
export const getCategories = asyncHandler(async (req, res) => {
  const cached = await cacheGet('categories');
  if (cached) return ApiResponse(res, 200, 'Categories', { categories: cached });

  const categories = await Product.distinct('category', { isActive: true });
  await cacheSet('categories', categories, 3600);
  ApiResponse(res, 200, 'Categories', { categories });
});
