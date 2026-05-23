export const ROLES = {
  USER:     'user',
  VENDOR:   'vendor',
  DELIVERY: 'delivery',
  ADMIN:    'admin',
};

export const ORDER_STATUS = {
  processing:       { label: 'Processing',       color: 'text-amber-600  bg-amber-50  border-amber-200' },
  packed:           { label: 'Packed',            color: 'text-blue-600   bg-blue-50   border-blue-200'  },
  out_for_delivery: { label: 'Out for Delivery',  color: 'text-purple-600 bg-purple-50 border-purple-200' },
  near_location:    { label: 'Near Location',     color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  delivered:        { label: 'Delivered',          color: 'text-green-600  bg-green-50  border-green-200'  },
  cancelled:        { label: 'Cancelled',          color: 'text-red-600    bg-red-50    border-red-200'    },
};

export const PAYMENT_STATUS = {
  pending:  { label: 'Pending',  color: 'text-amber-600 bg-amber-50 border-amber-200' },
  paid:     { label: 'Paid',     color: 'text-green-600 bg-green-50 border-green-200' },
  failed:   { label: 'Failed',   color: 'text-red-600   bg-red-50   border-red-200'   },
  refunded: { label: 'Refunded', color: 'text-gray-600  bg-gray-50  border-gray-200'  },
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
