import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../api/orderApi.js';
import { formatCurrency, formatDate, cn } from '../../utils/index.js';
import { PageLoader, Badge, Pagination, Modal } from '../../components/ui/index.jsx';
import { ORDER_STATUS, QUERY_KEYS } from '../../constants/index.js';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['processing', 'packed', 'out_for_delivery', 'near_location', 'delivered'];

export default function VendorOrdersPage() {
  const qc = useQueryClient();
  const [page, setPage]         = useState(1);
  const [statusFilter, setStatus] = useState('');
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.VENDOR_ORDERS, page, statusFilter],
    queryFn:  () => orderApi.getVendorOrders({ page, limit: 15, status: statusFilter || undefined }),
    select:   r => r.data.data,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => orderApi.updateStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries([QUERY_KEYS.VENDOR_ORDERS]);
      toast.success('Order status updated');
      setSelected(null);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const nextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Orders</h1>
        <div className="flex gap-1">
          {['', ...STATUS_FLOW].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={cn('px-3 py-1.5 text-xs border rounded capitalize transition-colors',
                statusFilter === s ? 'bg-ink text-white border-ink' : 'border-border hover:bg-tag')}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <div className="bg-surface border border-border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-tag">
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] font-semibold tracking-widest uppercase text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.orders?.map(o => {
                  const next = nextStatus(o.deliveryStatus);
                  return (
                    <tr key={o._id} className="hover:bg-tag/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <div className="text-subtle">{o.user?.name}</div>
                        <div className="text-xs text-muted">{o.user?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-subtle text-xs">{o.items?.length} item(s)</td>
                      <td className="px-4 py-3 font-mono text-xs">{formatCurrency(o.total)}</td>
                      <td className="px-4 py-3">
                        <span className={cn('font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border',
                          ORDER_STATUS[o.deliveryStatus]?.color)}>
                          {ORDER_STATUS[o.deliveryStatus]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-subtle text-xs">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setSelected(o)}
                            className="text-xs text-subtle hover:text-ink transition-colors">View</button>
                          {next && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: o._id, status: next })}
                              loading={updateStatus.isPending}>
                              → {ORDER_STATUS[next]?.label}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!data?.orders?.length && (
              <div className="text-center py-12 text-subtle text-sm">No orders found</div>
            )}
          </div>
          <Pagination page={page} pages={Math.ceil((data?.total || 0) / 15)} onChange={setPage} />
        </>
      )}

      {/* Order detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order #${selected?._id?.slice(-8).toUpperCase()}`} width="max-w-lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="label">Customer</div><div className="text-ink">{selected.user?.name}</div></div>
              <div><div className="label">Total</div><div className="font-mono text-ink">{formatCurrency(selected.total)}</div></div>
              <div className="col-span-2">
                <div className="label">Shipping Address</div>
                <div className="text-subtle">{selected.shippingAddress?.line1}, {selected.shippingAddress?.city}</div>
              </div>
            </div>
            <div>
              <div className="label mb-2">Items</div>
              <div className="space-y-2">
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 bg-tag rounded border border-border overflow-hidden flex-shrink-0">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted text-xs">□</div>}
                    </div>
                    <span className="flex-1 text-subtle truncate">{item.title} ×{item.quantity}</span>
                    <span className="font-mono text-xs">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
