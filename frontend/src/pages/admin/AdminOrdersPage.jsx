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
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Transactions Audit</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Global log of customer orders, billing, and fulfillment timelines</p>
        </div>
        <div className="flex gap-2 flex-wrap bg-surface/30 border border-border/80 p-1.5 rounded-xl">
          <div className="relative">
            <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input text-xs py-1.5 pr-8 w-auto appearance-none cursor-pointer">
              <option value="" className="bg-bg">Delivery: All Statuses</option>
              {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k} className="bg-bg">{v.label}</option>)}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none text-[8px]">▼</span>
          </div>

          <div className="relative">
            <select value={payFilter} onChange={e => { setPay(e.target.value); setPage(1); }} className="input text-xs py-1.5 pr-8 w-auto appearance-none cursor-pointer">
              <option value="" className="bg-bg">Payment: All Statuses</option>
              {Object.entries(PAYMENT_STATUS).map(([k, v]) => <option key={k} value={k} className="bg-bg">{v.label}</option>)}
            </select>
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none text-[8px]">▼</span>
          </div>
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-tag/30">
                  {['Order Ref', 'Customer Details', 'Manifest Size', 'Net Received', 'Payment Status', 'Delivery Stage', 'Transaction Date'].map(h => (
                    <th key={h} className="px-5 py-3 font-mono text-[9px] font-bold tracking-wider uppercase text-muted/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data?.orders?.map(o => (
                  <tr key={o._id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-ink">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-ink">{o.user?.name}</div>
                      <div className="text-[10px] text-muted/70 font-mono mt-0.5">{o.user?.email}</div>
                    </td>
                    <td className="px-5 py-4 text-subtle font-medium">{o.items?.length || 0} items</td>
                    <td className="px-5 py-4 font-mono font-semibold text-indigo-400">{formatCurrency(o.total)}</td>
                    <td className="px-5 py-4">
                      <span className={cn('font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border bg-tag text-subtle border-border',
                        PAYMENT_STATUS[o.paymentStatus]?.color)}>
                        {PAYMENT_STATUS[o.paymentStatus]?.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border bg-tag text-subtle border-border',
                        ORDER_STATUS[o.deliveryStatus]?.color)}>
                        {ORDER_STATUS[o.deliveryStatus]?.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted/80 font-mono text-[10px]">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.orders?.length && (
              <div className="text-center py-16 text-muted/70 text-xs">No customer orders matching selected filters found</div>
            )}
          </div>
          <Pagination page={page} pages={Math.ceil((data?.total || 0) / 20)} onChange={setPage} />
        </>
      )}
    </div>
  );
}
