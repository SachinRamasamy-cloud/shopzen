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
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Global Catalog</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Audit merchant product listings, pricing details, and moderation visibility</p>
        </div>
        <input placeholder="Search product title..." onChange={e => debouncedSearch(e.target.value)} className="input max-w-xs" />
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-tag/30">
                  {['Product Details', 'Category', 'Store Vendor', 'Unit Price', 'Stock Level', 'Moderation', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 font-mono text-[9px] font-bold tracking-wider uppercase text-muted/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data?.products?.map(p => (
                  <tr key={p._id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-tag/30 rounded-xl border border-border/80 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt="" className="w-full h-full object-contain rounded-lg" />
                            : <div className="w-full h-full flex items-center justify-center text-muted/50 text-xs">□</div>}
                        </div>
                        <span className="font-bold text-ink max-w-[200px] truncate">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-subtle font-medium">{p.category}</td>
                    <td className="px-5 py-4 text-subtle font-medium">{p.vendor?.storeName || '—'}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-indigo-400">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-4 font-mono font-bold text-ink/90">{p.stock} units</td>
                    <td className="px-5 py-4">
                      <Badge variant={p.isActive ? 'success' : 'danger'} className="text-[9px] uppercase font-mono tracking-wider">{p.isActive ? 'Active' : 'Hidden'}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Button size="sm" variant={p.isActive ? 'outline' : 'primary'}
                        onClick={() => toggleProduct.mutate(p._id)} loading={toggleProduct.isPending} className="rounded-xl">
                        {p.isActive ? 'Hide Listing' : 'Publish Listing'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.products?.length && (
              <div className="text-center py-16 text-muted/70 text-xs">No matching products found in the catalog database</div>
            )}
          </div>
          <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />
        </>
      )}
    </div>
  );
}
