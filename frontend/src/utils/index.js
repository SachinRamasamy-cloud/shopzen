// Format currency
export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

// Format date
export const formatDate = (date, opts = {}) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', ...opts }).format(new Date(date));

// Format relative time
export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  if (days  < 30)  return `${days}d ago`;
  return formatDate(date);
};

// Truncate text
export const truncate = (str, n = 100) =>
  str?.length > n ? str.slice(0, n).trimEnd() + '…' : str;

// Slugify
export const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Calculate discount percentage
export const discountPct = (price, comparePrice) =>
  comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

// Extract error message from axios error
export const getErrMsg = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong';

// Validate email
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Generate star array
export const stars = (rating) =>
  Array.from({ length: 5 }, (_, i) => (i < Math.floor(rating) ? 'full' : i < rating ? 'half' : 'empty'));

// Debounce
export const debounce = (fn, ms = 300) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

// Class names helper (simple)
export const cn = (...classes) => classes.filter(Boolean).join(' ');
