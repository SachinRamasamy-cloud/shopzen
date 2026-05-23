import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice.js';
import { formatCurrency, discountPct, cn } from '../../utils/index.js';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { _id, title, price, comparePrice, images, ratingsAvg, ratingsCount, vendor, stock } = product;
  const pct = discountPct(price, comparePrice);
  const img = images?.[0]?.url || images?.[0] || null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (stock <= 0) return;
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success('Added to cart');
  };

  return (
    <Link
      to={`/product/${_id}`}
      className="group bg-surface border border-border rounded overflow-hidden hover:border-ink/30 transition-colors block"
    >
      {/* Image */}
      <div className="aspect-square bg-tag relative overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-4xl">□</div>
        )}
        {pct > 0 && (
          <span className="absolute top-2 left-2 font-mono text-[10px] font-bold bg-ink text-white px-1.5 py-0.5 rounded">
            -{pct}%
          </span>
        )}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="font-mono text-xs font-semibold text-subtle">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        {vendor?.storeName && (
          <p className="font-mono text-[10px] text-muted uppercase tracking-wider mb-1">{vendor.storeName}</p>
        )}
        <h3 className="text-sm font-medium text-ink leading-snug line-clamp-2 mb-2">{title}</h3>

        {/* Rating */}
        {ratingsCount > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex gap-px">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={cn('text-xs', i < Math.round(ratingsAvg) ? 'text-amber-400' : 'text-border')}>★</span>
              ))}
            </div>
            <span className="font-mono text-[10px] text-muted">({ratingsCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono font-semibold text-ink">{formatCurrency(price)}</span>
          {comparePrice > price && (
            <span className="font-mono text-xs text-muted line-through">{formatCurrency(comparePrice)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className={cn(
            'w-full py-1.5 text-xs font-medium border rounded transition-colors',
            stock > 0
              ? 'border-ink text-ink hover:bg-ink hover:text-white'
              : 'border-border text-muted cursor-not-allowed',
          )}
        >
          {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </Link>
  );
}
