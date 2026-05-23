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
      className="group bg-surface/30 backdrop-blur-md border border-border/80 rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 block"
    >
      {/* Image */}
      <div className="aspect-square bg-tag/30 relative overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted/50 text-4xl">□</div>
        )}
        {pct > 0 && (
          <span className="absolute top-3 left-3 font-mono text-[9px] font-bold bg-gradient-to-r from-pink-500 to-rose-500 text-white px-2 py-0.5 rounded-full shadow-lg">
            -{pct}%
          </span>
        )}
        {stock <= 0 && (
          <div className="absolute inset-0 bg-bg/85 backdrop-blur-xs flex items-center justify-center">
            <span className="font-heading text-xs font-semibold text-rose-400 tracking-wider uppercase">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {vendor?.storeName && (
          <p className="font-mono text-[9px] text-muted/70 uppercase tracking-wider mb-1.5">{vendor.storeName}</p>
        )}
        <h3 className="text-xs font-semibold text-ink leading-relaxed line-clamp-2 mb-2 group-hover:text-primary transition-colors">{title}</h3>

        {/* Rating */}
        {ratingsCount > 0 && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <div className="flex gap-px">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={cn('text-xs leading-none', i < Math.round(ratingsAvg) ? 'text-amber-400' : 'text-border/40')}>★</span>
              ))}
            </div>
            <span className="font-mono text-[9px] text-muted/70">({ratingsCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3.5">
          <span className="font-heading font-bold text-sm text-indigo-400">{formatCurrency(price)}</span>
          {comparePrice > price && (
            <span className="font-mono text-xs text-muted/50 line-through">{formatCurrency(comparePrice)}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className={cn(
            'w-full py-2 text-xs font-semibold rounded-xl border transition-all duration-200',
            stock > 0
              ? 'bg-primary/10 border-primary/20 text-indigo-300 hover:bg-primary hover:text-white hover:shadow-glow-primary active:scale-[0.98]'
              : 'border-border/40 text-muted/30 cursor-not-allowed',
          )}
        >
          {stock > 0 ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>
    </Link>
  );
}
