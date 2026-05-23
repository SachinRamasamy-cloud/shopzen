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
    <div className="space-y-16 py-4">
      {/* Hero */}
      <section className="relative overflow-hidden border border-border/80 rounded-3xl bg-surface/25 backdrop-blur-lg p-10 md:p-20 shadow-glass">
        {/* Futuristic background glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Multi-vendor Platform</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-ink leading-tight mb-6 tracking-tight font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">Everything you need,</span><br />
            delivered to your door.
          </h1>
          <p className="text-subtle mb-8 text-sm md:text-base leading-relaxed max-w-lg font-normal">
            Shop from hundreds of verified vendors. Track your orders in real time with our next-gen dashboard.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-semibold rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
          >
            Browse Products &nbsp; →
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink">Browse Categories</h2>
            <p className="text-[11px] text-muted font-mono mt-0.5 uppercase tracking-wider">Curated catalog filter</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {CATEGORIES.slice(0, 10).map(cat => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="px-4 py-3.5 text-xs text-center font-semibold border border-border/80 rounded-xl bg-surface/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-subtle hover:text-ink"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-ink">New Arrivals</h2>
            <p className="text-[11px] text-muted font-mono mt-0.5 uppercase tracking-wider">LATEST PRODUCTS ADDED</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
        </div>
        {isLoading ? <PageLoader /> : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {data?.products?.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* CTA banners */}
      <section className="grid md:grid-cols-3 gap-6">
        <Link to="/auth/register?role=vendor"
          className="relative overflow-hidden border border-border/80 rounded-2xl p-6 bg-surface/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]">
          <div className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-2">For Businesses</div>
          <div className="font-heading font-bold text-ink text-base mb-1">Sell on ShopZen</div>
          <div className="text-xs text-subtle leading-relaxed">List your products and reach thousands of digital shoppers instantly.</div>
        </Link>
        <Link to="/auth/register?role=delivery"
          className="relative overflow-hidden border border-border/80 rounded-2xl p-6 bg-surface/20 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]">
          <div className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-wider mb-2">For Riders</div>
          <div className="font-heading font-bold text-ink text-base mb-1">Deliver with us</div>
          <div className="text-xs text-subtle leading-relaxed">Earn competitive payouts delivering orders on your own flexible schedule.</div>
        </Link>
        <div className="relative overflow-hidden border border-indigo-500/20 rounded-2xl p-6 bg-gradient-to-br from-indigo-950/40 via-indigo-900/10 to-violet-950/40 text-ink shadow-[0_0_15px_rgba(99,102,241,0.1)]">
          <div className="font-mono text-[9px] font-bold text-indigo-300 uppercase tracking-wider mb-2">Guarantee</div>
          <div className="font-heading font-bold text-ink text-base mb-1">Secure Network</div>
          <div className="text-xs text-subtle leading-relaxed">Powered by Stripe. Your personal credentials and payments are fully encrypted.</div>
        </div>
      </section>
    </div>
  );
}
