import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import { Pagination, PageLoader, Empty } from '../ui/index.jsx';
import { CATEGORIES, SORT_OPTIONS } from '../../constants/index.js';
import { debounce, cn } from '../../utils/index.js';

export function ProductFilters({ onFilter }) {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');

  const update = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setParams(next);
    onFilter?.(Object.fromEntries(next));
  };

  const debouncedSearch = debounce((v) => update('search', v), 400);

  return (
    <aside className="w-56 flex-shrink-0 space-y-6 bg-surface/20 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-glass h-fit">
      {/* Search */}
      <div className="space-y-2">
        <label className="label">Search</label>
        <div className="relative">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); debouncedSearch(e.target.value); }}
            placeholder="Search products…"
            className="input pr-8"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60 text-xs">🔍</span>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="label">Category</label>
        <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
          <button
            onClick={() => update('category', '')}
            className={cn('w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all',
              !params.get('category')
                ? 'bg-primary text-white shadow-glow-primary'
                : 'hover:bg-primary/10 hover:text-ink text-subtle')}
          >All Products</button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => update('category', cat)}
              className={cn('w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all',
                params.get('category') === cat
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'hover:bg-primary/10 hover:text-ink text-subtle')}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="space-y-2">
        <label className="label">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number" placeholder="Min"
            defaultValue={params.get('minPrice') || ''}
            onBlur={e => update('minPrice', e.target.value)}
            className="input text-center"
          />
          <span className="text-muted/50 self-center text-xs">—</span>
          <input
            type="number" placeholder="Max"
            defaultValue={params.get('maxPrice') || ''}
            onBlur={e => update('maxPrice', e.target.value)}
            className="input text-center"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <label className="label">Sort By</label>
        <div className="relative">
          <select
            value={params.get('sort') || '-createdAt'}
            onChange={e => update('sort', e.target.value)}
            className="input appearance-none cursor-pointer pr-8"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-bg text-ink">{o.label}</option>)}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none text-[10px]">▼</span>
        </div>
      </div>

      {/* Clear */}
      {params.size > 0 && (
        <button
          onClick={() => { setParams({}); setSearch(''); }}
          className="w-full py-2 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 text-xs font-bold rounded-xl transition-all"
        >Clear Filters</button>
      )}
    </aside>
  );
}

export function ProductGrid({ products, loading, page, pages, onPageChange }) {
  if (loading) return <PageLoader />;
  if (!products?.length) return <Empty title="No products found" description="Try adjusting your search criteria or filters" icon="🔍" />;

  return (
    <div className="flex-1 space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => <ProductCard key={p._id} product={p} />)}
      </div>
      <Pagination page={page} pages={pages} onChange={onPageChange} />
    </div>
  );
}
