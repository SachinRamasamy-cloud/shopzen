import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../api/productApi.js';
import { adminApi } from '../../api/index.js';
import { formatCurrency, formatDate, debounce } from '../../utils/index.js';
import { PageLoader, Badge, Pagination } from '../../components/ui/index.jsx';
import { QUERY_KEYS } from '../../constants/index.js';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

export default function AdminProductsPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, 'admin', page, search],
    queryFn:  () => productApi.getAll({ page, limit: 20, search: search || undefined }),
    select:   r => r.data.data,
    keepPreviousData: true,
  });

  const toggleProduct = useMutation({
    mutationFn: adminApi.toggleProduct,
    onSuccess: () => { qc.invalidateQueries([QUERY_KEYS.PRODUCTS]); toast.success('Product status updated'); },
  });

  const debouncedSearch = debounce(setSearch, 400);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Products <span className="text-subtle font-normal text-sm">({data?.total || 0})</span></h1>
        <input placeholder="Search products…" onChange={e => debouncedSearch(e.target.value)} className="input max-w-xs" />
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <div className="bg-surface border border-border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-tag">
                  {['Product', 'Category', 'Vendor', 'Price', 'Stock', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] font-semibold tracking-widest uppercase text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.products?.map(p => (
                  <tr key={p._id} className="hover:bg-tag/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-tag rounded border border-border overflow-hidden flex-shrink-0">
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-muted text-xs">□</div>}
                        </div>
                        <span className="font-medium text-ink max-w-[160px] truncate">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-subtle text-xs">{p.category}</td>
                    <td className="px-4 py-3 text-subtle text-xs">{p.vendor?.storeName || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{p.stock}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.isActive ? 'success' : 'danger'}>{p.isActive ? 'Active' : 'Hidden'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant={p.isActive ? 'outline' : 'primary'}
                        onClick={() => toggleProduct.mutate(p._id)} loading={toggleProduct.isPending}>
                        {p.isActive ? 'Hide' : 'Show'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.products?.length && (
              <div className="text-center py-12 text-subtle text-sm">No products found</div>
            )}
          </div>
          <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />
        </>
      )}
    </div>
  );
}
