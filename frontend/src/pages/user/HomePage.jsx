import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api/productApi.js';
import ProductCard from '../../components/product/ProductCard.jsx';
import { PageLoader } from '../../components/ui/index.jsx';
import { CATEGORIES, QUERY_KEYS } from '../../constants/index.js';

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, 'featured'],
    queryFn:  () => productApi.getAll({ limit: 8, sort: '-createdAt' }),
    select:   (r) => r.data.data,
  });

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="border border-border rounded bg-surface p-10 md:p-16">
        <div className="max-w-xl">
          <div className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Multi-vendor Platform</div>
          <h1 className="text-3xl md:text-4xl font-semibold text-ink leading-tight mb-4">
            Everything you need,<br />delivered to your door.
          </h1>
          <p className="text-subtle mb-6 leading-relaxed">
            Shop from hundreds of vendors. Track your orders in real time.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 bg-ink text-white text-sm font-medium rounded border border-ink hover:bg-ink/90 transition-colors"
          >
            Browse Products →
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs font-semibold tracking-widest uppercase text-ink">Categories</h2>
          <Link to="/products" className="text-xs text-muted hover:text-ink transition-colors">View all →</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {CATEGORIES.slice(0, 10).map(cat => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="px-3 py-2.5 text-xs text-center border border-border rounded hover:border-ink/40 hover:bg-tag transition-colors text-subtle hover:text-ink"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-xs font-semibold tracking-widest uppercase text-ink">New Arrivals</h2>
          <Link to="/products" className="text-xs text-muted hover:text-ink transition-colors">View all →</Link>
        </div>
        {isLoading ? <PageLoader /> : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data?.products?.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA banners */}
      <section className="grid md:grid-cols-3 gap-4">
        <Link to="/auth/register?role=vendor"
          className="border border-border rounded p-6 hover:border-ink/30 hover:bg-surface transition-colors">
          <div className="font-mono text-xs text-muted uppercase tracking-widest mb-2">For Businesses</div>
          <div className="font-semibold text-ink mb-1">Sell on Store</div>
          <div className="text-sm text-subtle">List your products and reach thousands of customers.</div>
        </Link>
        <Link to="/auth/register?role=delivery"
          className="border border-border rounded p-6 hover:border-ink/30 hover:bg-surface transition-colors">
          <div className="font-mono text-xs text-muted uppercase tracking-widest mb-2">For Riders</div>
          <div className="font-semibold text-ink mb-1">Deliver with us</div>
          <div className="text-sm text-subtle">Earn money delivering orders on your schedule.</div>
        </Link>
        <div className="border border-border rounded p-6 bg-ink text-white">
          <div className="font-mono text-xs text-white/50 uppercase tracking-widest mb-2">Guarantee</div>
          <div className="font-semibold mb-1">Secure Payments</div>
          <div className="text-sm text-white/70">Powered by Stripe. Your data is always protected.</div>
        </div>
      </section>
    </div>
  );
}
