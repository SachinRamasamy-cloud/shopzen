import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api/productApi.js';
import { ProductFilters, ProductGrid } from '../../components/product/ProductGrid.jsx';
import { QUERY_KEYS } from '../../constants/index.js';

export default function ProductsPage() {
  const [searchParams]  = useSearchParams();
  const [page, setPage] = useState(1);

  const params = Object.fromEntries(searchParams);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, { ...params, page }],
    queryFn:  () => productApi.getAll({ ...params, page, limit: 16 }),
    select:   r => r.data.data,
    keepPreviousData: true,
  });

  return (
    <div className="py-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Explore Catalog</h1>
        {data?.total !== undefined ? (
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">{data.total} products available</p>
        ) : (
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Search or filter items</p>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-8">
        <ProductFilters />
        <ProductGrid
          products={data?.products}
          loading={isLoading}
          page={page}
          pages={data?.pages || 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
