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
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Products</h1>
        {data?.total !== undefined && (
          <p className="text-sm text-subtle mt-0.5">{data.total} items found</p>
        )}
      </div>
      <div className="flex gap-8">
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
