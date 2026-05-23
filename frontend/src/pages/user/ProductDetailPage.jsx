import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { productApi } from '../../api/productApi.js';
import { reviewApi } from '../../api/index.js';
import { addToCart } from '../../features/cart/cartSlice.js';
import { PageLoader, Badge } from '../../components/ui/index.jsx';
import { formatCurrency, discountPct, timeAgo, cn } from '../../utils/index.js';
import { QUERY_KEYS } from '../../constants/index.js';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const [imgIdx, setImgIdx]   = useState(0);
  const [qty, setQty]         = useState(1);
  const [variant, setVariant] = useState(null);

  const { data: pd, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCT, id],
    queryFn:  () => productApi.getOne(id),
    select:   r => r.data.data.product,
  });

  const { data: reviewData } = useQuery({
    queryKey: [QUERY_KEYS.REVIEWS, id],
    queryFn:  () => reviewApi.getByProduct(id, { limit: 5 }),
    select:   r => r.data.data,
    enabled:  !!id,
  });

  if (isLoading) return <PageLoader />;
  if (!pd) return <div className="text-center py-24 text-subtle">Product not found.</div>;

  const pct    = discountPct(pd.price, pd.comparePrice);
  const images = pd.images || [];

  const handleAddToCart = () => {
    dispatch(addToCart({ product: pd, quantity: qty, variant }));
    toast.success('Added to cart');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-4">
      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-surface/20 backdrop-blur-md rounded-2xl border border-border/80 overflow-hidden flex items-center justify-center p-4 shadow-glass">
            {images[imgIdx]?.url ? (
              <img src={images[imgIdx].url} alt={pd.title} className="w-full h-full object-contain hover:scale-102 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted/55 text-6xl">□</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={cn('w-16 h-16 flex-shrink-0 rounded-xl border overflow-hidden transition-all bg-surface/30',
                    i === imgIdx ? 'border-primary shadow-glow-primary scale-102' : 'border-border/85 hover:border-indigo-500/50')}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            {pd.vendor?.storeName && (
              <p className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{pd.vendor.storeName}</p>
            )}
            <h1 className="text-2xl font-bold text-ink leading-tight font-heading">{pd.title}</h1>
          </div>

          {/* Rating */}
          {pd.ratingsCount > 0 && (
            <div className="flex items-center gap-2 bg-surface/30 border border-border/80 w-fit px-3 py-1 rounded-xl">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={cn('text-sm leading-none', i < Math.round(pd.ratingsAvg) ? 'text-amber-400' : 'text-border/40')}>★</span>
                ))}
              </div>
              <span className="text-xs font-semibold text-subtle">{pd.ratingsAvg} &nbsp;({pd.ratingsCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="font-heading text-3xl font-extrabold text-indigo-400">{formatCurrency(pd.price)}</span>
            {pd.comparePrice > pd.price && (
              <span className="font-mono text-base text-muted/50 line-through">{formatCurrency(pd.comparePrice)}</span>
            )}
            {pct > 0 && <Badge variant="success" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-300 rounded-lg px-2.5 py-1">-{pct}% OFF</Badge>}
          </div>

          {/* Stock status indicator */}
          <div className="flex items-center gap-2.5 bg-surface/30 border border-border/80 w-fit px-3.5 py-1.5 rounded-xl text-xs font-medium">
            <span className={cn('w-2 h-2 rounded-full', pd.stock > 0 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]')} />
            <span className="text-subtle">
              {pd.stock > 0 ? `${pd.stock} units available` : 'Out of stock'}
            </span>
          </div>

          {/* Variants */}
          {pd.variants?.length > 0 && (
            <div className="space-y-2">
              <label className="label">Select Options</label>
              <div className="flex flex-wrap gap-2.5">
                {pd.variants.map(v => (
                  <button key={v._id}
                    onClick={() => setVariant(v)}
                    className={cn('px-4 py-2 text-xs font-semibold border rounded-xl transition-all',
                      variant?._id === v._id
                        ? 'border-primary bg-primary text-white shadow-glow-primary'
                        : 'border-border/80 bg-surface/20 text-subtle hover:border-primary/50 hover:text-ink')}
                  >
                    {v.name}: {v.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <label className="label">Quantity</label>
            <div className="flex items-center gap-1.5 bg-surface/30 border border-border/80 w-fit rounded-xl p-1">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-tag text-sm text-subtle hover:text-ink transition-colors">−</button>
              <span className="w-10 text-center font-mono font-bold text-sm text-ink">{qty}</span>
              <button onClick={() => setQty(q => Math.min(pd.stock, q + 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-tag text-sm text-subtle hover:text-ink transition-colors">+</button>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button onClick={handleAddToCart} disabled={pd.stock <= 0} className="w-full btn-lg">
              {pd.stock > 0 ? 'Add to Shopping Cart' : 'Out of Stock'}
            </Button>
          </div>

          {/* Description */}
          <div className="pt-6 border-t border-border/60 space-y-2">
            <label className="label">Product Details</label>
            <p className="text-xs md:text-sm text-subtle leading-relaxed whitespace-pre-line">{pd.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="pt-8 border-t border-border/60 space-y-6">
        <div>
          <h2 className="font-heading text-lg font-bold text-ink">
            Customer Reviews ({reviewData?.total || 0})
          </h2>
          <p className="text-[11px] font-mono text-muted uppercase tracking-wider mt-0.5 font-medium">Feedback from verified buyers</p>
        </div>
        {reviewData?.reviews?.length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {reviewData.reviews.map(r => (
              <div key={r._id} className="border border-border/80 rounded-2xl p-5 bg-surface/20 backdrop-blur-md shadow-glass space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-glow-primary">
                      {r.user?.name ? r.user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-ink block">{r.user?.name}</span>
                      {r.verifiedPurchase && <Badge variant="success" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-300 text-[8px] rounded mt-0.5">Verified Buyer</Badge>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-px">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={cn('text-[10px]', i < r.rating ? 'text-amber-400' : 'text-border/30')}>★</span>
                      ))}
                    </div>
                    <span className="text-[9px] font-mono text-muted/70">{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
                {r.title && <p className="font-heading font-semibold text-xs text-ink">{r.title}</p>}
                {r.body  && <p className="text-xs text-subtle leading-relaxed">{r.body}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted/80 bg-surface/20 border border-border/80 rounded-xl p-6 text-center">No reviews yet. Be the first to share your experience!</p>
        )}
      </div>
    </div>
  );
}
