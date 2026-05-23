import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/index.js';
import { formatCurrency, formatDate, cn } from '../../utils/index.js';
import { PageLoader, Badge, Pagination } from '../../components/ui/index.jsx';
import { ORDER_STATUS, PAYMENT_STATUS, QUERY_KEYS } from '../../constants/index.js';

export default function AdminOrdersPage() {
  const [page, setPage]           = useState(1);
  const [statusFilter, setStatus] = useState('');
  const [payFilter, setPay]       = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_ORDERS, page, statusFilter, payFilter],
    queryFn:  () => adminApi.getAllOrders({ page, limit: 20, status: statusFilter || undefined, paymentStatus: payFilter || undefined }),
    select:   r => r.data.data,
    keepPreviousData: true,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-ink">All Orders <span className="text-subtle font-normal text-sm">({data?.total || 0})</span></h1>
        <div className="flex gap-2 flex-wrap">
          <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input text-xs py-1.5 w-auto">
            <option value="">Delivery: All</option>
            {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={payFilter} onChange={e => { setPay(e.target.value); setPage(1); }} className="input text-xs py-1.5 w-auto">
            <option value="">Payment: All</option>
            {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <div className="bg-surface border border-border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-tag">
                  {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Delivery', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] font-semibold tracking-widest uppercase text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.orders?.map(o => (
                  <tr key={o._id} className="hover:bg-tag/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <div className="text-subtle">{o.user?.name}</div>
                      <div className="text-xs text-muted">{o.user?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-subtle text-xs">{o.items?.length}</td>
                    <td className="px-4 py-3 font-mono text-xs">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border',
                        PAYMENT_STATUS[o.paymentStatus]?.color)}>
                        {PAYMENT_STATUS[o.paymentStatus]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border',
                        ORDER_STATUS[o.deliveryStatus]?.color)}>
                        {ORDER_STATUS[o.deliveryStatus]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.orders?.length && (
              <div className="text-center py-12 text-subtle text-sm">No orders found</div>
            )}
          </div>
          <Pagination page={page} pages={Math.ceil((data?.total || 0) / 20)} onChange={setPage} />
        </>
      )}
    </div>
  );
}
