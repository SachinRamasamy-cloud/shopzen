export const ROLES = {
  USER:     'user',
  VENDOR:   'vendor',
  DELIVERY: 'delivery',
  ADMIN:    'admin',
};

export const ORDER_STATUS = {
  processing:       { label: 'Processing',       color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  packed:           { label: 'Packed',            color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  out_for_delivery: { label: 'Out for Delivery',  color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20' },
  near_location:    { label: 'Near Location',     color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  delivered:        { label: 'Delivered',          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  cancelled:        { label: 'Cancelled',          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

export const PAYMENT_STATUS = {
  pending:  { label: 'Pending',  color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  paid:     { label: 'Paid',     color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  failed:   { label: 'Failed',   color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  refunded: { label: 'Refunded', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

export const CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Home & Garden',
  'Sports', 'Beauty', 'Toys', 'Automotive', 'Food', 'Health',
];

export const SORT_OPTIONS = [
  { value: '-createdAt',   label: 'Newest First'   },
  { value: 'price',        label: 'Price: Low → High' },
  { value: '-price',       label: 'Price: High → Low' },
  { value: '-ratingsAvg',  label: 'Top Rated'       },
];

export const QUERY_KEYS = {
  PRODUCTS:        'products',
  PRODUCT:         'product',
  CATEGORIES:      'categories',
  MY_ORDERS:       'my-orders',
  ORDER:           'order',
  VENDOR_ORDERS:   'vendor-orders',
  VENDOR_DASHBOARD:'vendor-dashboard',
  VENDOR_PRODUCTS: 'vendor-products',
  VENDOR_COUPONS:  'vendor-coupons',
  ADMIN_DASHBOARD: 'admin-dashboard',
  ADMIN_USERS:     'admin-users',
  ADMIN_VENDORS:   'admin-vendors',
  ADMIN_ORDERS:    'admin-orders',
  DELIVERY_DASH:   'delivery-dashboard',
  REVIEWS:         'reviews',
  ME:              'me',
};
