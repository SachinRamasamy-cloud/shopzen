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
  if (!pd) return <div className="text-center py-16 text-subtle">Product not found.</div>;

  const pct    = discountPct(pd.price, pd.comparePrice);
  const images = pd.images || [];

  const handleAddToCart = () => {
    dispatch(addToCart({ product: pd, quantity: qty, variant }));
    toast.success('Added to cart');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Main grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-tag rounded border border-border overflow-hidden">
            {images[imgIdx]?.url ? (
              <img src={images[imgIdx].url} alt={pd.title} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-6xl">□</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={cn('w-14 h-14 flex-shrink-0 rounded border overflow-hidden',
                    i === imgIdx ? 'border-ink' : 'border-border')}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {pd.vendor?.storeName && (
            <p className="font-mono text-xs text-muted uppercase tracking-wider">{pd.vendor.storeName}</p>
          )}
          <h1 className="text-xl font-semibold text-ink leading-snug">{pd.title}</h1>

          {/* Rating */}
          {pd.ratingsCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={cn('text-sm', i < Math.round(pd.ratingsAvg) ? 'text-amber-400' : 'text-border')}>★</span>
                ))}
              </div>
              <span className="text-sm text-subtle">{pd.ratingsAvg} ({pd.ratingsCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-semibold text-ink">{formatCurrency(pd.price)}</span>
            {pd.comparePrice > pd.price && (
              <span className="font-mono text-base text-muted line-through">{formatCurrency(pd.comparePrice)}</span>
            )}
            {pct > 0 && <Badge variant="success">-{pct}% OFF</Badge>}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full', pd.stock > 0 ? 'bg-green-500' : 'bg-red-400')} />
            <span className="text-sm text-subtle">
              {pd.stock > 0 ? `${pd.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Variants */}
          {pd.variants?.length > 0 && (
            <div>
              <label className="label">Options</label>
              <div className="flex flex-wrap gap-2">
                {pd.variants.map(v => (
                  <button key={v._id}
                    onClick={() => setVariant(v)}
                    className={cn('px-3 py-1.5 text-xs border rounded transition-colors',
                      variant?._id === v._id ? 'border-ink bg-ink text-white' : 'border-border hover:border-ink/40')}
                  >
                    {v.name}: {v.value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="label">Quantity</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-tag text-sm">−</button>
              <span className="w-10 text-center font-mono text-sm">{qty}</span>
              <button onClick={() => setQty(q => Math.min(pd.stock, q + 1))}
                className="w-8 h-8 border border-border rounded flex items-center justify-center hover:bg-tag text-sm">+</button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleAddToCart} disabled={pd.stock <= 0} className="flex-1">
              {pd.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-border">
            <label className="label mb-2">Description</label>
            <p className="text-sm text-subtle leading-relaxed">{pd.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="font-mono text-xs font-semibold tracking-widest uppercase text-ink mb-4">
          Reviews ({reviewData?.total || 0})
        </h2>
        {reviewData?.reviews?.length ? (
          <div className="space-y-4">
            {reviewData.reviews.map(r => (
              <div key={r._id} className="border border-border rounded p-4 bg-surface">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-medium text-sm text-ink">{r.user?.name}</span>
                    {r.verifiedPurchase && <Badge variant="success" className="ml-2">Verified</Badge>}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className={cn('text-xs', i < r.rating ? 'text-amber-400' : 'text-border')}>★</span>
                    ))}
                    <span className="text-xs text-muted ml-1">{timeAgo(r.createdAt)}</span>
                  </div>
                </div>
                {r.title && <p className="font-medium text-sm text-ink mb-1">{r.title}</p>}
                {r.body  && <p className="text-sm text-subtle leading-relaxed">{r.body}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No reviews yet. Be the first to review.</p>
        )}
      </div>
    </div>
  );
}
