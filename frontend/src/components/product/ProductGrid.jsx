import { useState, useEffect } from 'react';
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
    <aside className="w-56 flex-shrink-0 space-y-5">
      {/* Search */}
      <div>
        <label className="label">Search</label>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); debouncedSearch(e.target.value); }}
          placeholder="Search products…"
          className="input"
        />
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <div className="space-y-1">
          <button
            onClick={() => update('category', '')}
            className={cn('w-full text-left px-2 py-1.5 text-sm rounded transition-colors',
              !params.get('category') ? 'bg-ink text-white' : 'hover:bg-tag text-subtle')}
          >All</button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => update('category', cat)}
              className={cn('w-full text-left px-2 py-1.5 text-sm rounded transition-colors',
                params.get('category') === cat ? 'bg-ink text-white' : 'hover:bg-tag text-subtle')}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="label">Price Range</label>
        <div className="flex gap-2">
          <input
            type="number" placeholder="Min"
            defaultValue={params.get('minPrice') || ''}
            onBlur={e => update('minPrice', e.target.value)}
            className="input"
          />
          <input
            type="number" placeholder="Max"
            defaultValue={params.get('maxPrice') || ''}
            onBlur={e => update('maxPrice', e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="label">Sort By</label>
        <select
          value={params.get('sort') || '-createdAt'}
          onChange={e => update('sort', e.target.value)}
          className="input appearance-none cursor-pointer"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Clear */}
      {params.size > 0 && (
        <button
          onClick={() => { setParams({}); setSearch(''); }}
          className="text-xs text-muted hover:text-ink underline"
        >Clear filters</button>
      )}
    </aside>
  );
}

export function ProductGrid({ products, loading, page, pages, onPageChange }) {
  if (loading) return <PageLoader />;
  if (!products?.length) return <Empty title="No products found" description="Try adjusting your filters" icon="□" />;

  return (
    <div className="flex-1">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p => <ProductCard key={p._id} product={p} />)}
      </div>
      <Pagination page={page} pages={pages} onChange={onPageChange} />
    </div>
  );
}
