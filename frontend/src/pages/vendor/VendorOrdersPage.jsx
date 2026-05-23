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
    <div className="space-y-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Incoming Orders</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Track customer orders and manage fulfillment status</p>
        </div>
        <div className="flex flex-wrap gap-1.5 bg-surface/30 border border-border/80 p-1 rounded-xl w-fit">
          {['', ...STATUS_FLOW].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all',
                statusFilter === s ? 'bg-primary text-white shadow-glow-primary' : 'hover:bg-primary/10 hover:text-ink text-subtle')}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-tag/30">
                  {['Order Ref', 'Customer Info', 'Items Count', 'Net Amount', 'Current Status', 'Date Created', ''].map(h => (
                    <th key={h} className="px-5 py-3 font-mono text-[9px] font-bold tracking-wider uppercase text-muted/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data?.orders?.map(o => {
                  const next = nextStatus(o.deliveryStatus);
                  return (
                    <tr key={o._id} className="hover:bg-surface/20 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-ink">#{o._id.slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-ink/90">{o.user?.name}</div>
                        <div className="text-[10px] text-muted/70 font-mono mt-0.5">{o.user?.email}</div>
                      </td>
                      <td className="px-5 py-4 text-subtle font-medium">{o.items?.length || 0} items</td>
                      <td className="px-5 py-4 font-mono font-semibold text-indigo-400">{formatCurrency(o.total)}</td>
                      <td className="px-5 py-4">
                        <span className={cn('font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border bg-tag text-subtle border-border',
                          ORDER_STATUS[o.deliveryStatus]?.color)}>
                          {ORDER_STATUS[o.deliveryStatus]?.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted/80 font-mono text-[10px]">{formatDate(o.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center gap-3.5 justify-end">
                          <button onClick={() => setSelected(o)}
                            className="text-xs font-semibold text-subtle hover:text-primary transition-colors">Details</button>
                          {next && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: o._id, status: next })}
                              loading={updateStatus.isPending} className="rounded-xl font-mono text-[9px] tracking-wider uppercase">
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
              <div className="text-center py-16 text-muted/70 text-xs">No matching customer orders found</div>
            )}
          </div>
          <Pagination page={page} pages={Math.ceil((data?.total || 0) / 15)} onChange={setPage} />
        </>
      )}

      {/* Order detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order Reference: #${selected?._id?.slice(-8).toUpperCase()}`} width="max-w-lg">
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-xs font-medium bg-surface/30 border border-border/80 p-4 rounded-xl">
              <div><div className="label">Customer Contact</div><div className="text-ink font-semibold">{selected.user?.name}</div></div>
              <div><div className="label">Grand Total</div><div className="font-heading text-indigo-400 font-bold">{formatCurrency(selected.total)}</div></div>
              <div className="col-span-2">
                <div className="label">Delivery Destination</div>
                <div className="text-subtle/90 leading-relaxed font-semibold">{selected.shippingAddress?.line1}, {selected.shippingAddress?.line2 ? `${selected.shippingAddress.line2}, ` : ''}{selected.shippingAddress?.city}, {selected.shippingAddress?.state} — {selected.shippingAddress?.pincode}</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="label">Order Manifest Items</div>
              <div className="divide-y divide-border/60 max-h-[220px] overflow-y-auto pr-1">
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 text-xs font-medium">
                    <div className="w-8 h-8 bg-tag/30 rounded-lg border border-border/80 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-contain rounded" /> : <div className="w-full h-full flex items-center justify-center text-muted/50 text-[10px]">□</div>}
                    </div>
                    <span className="flex-1 text-ink/90 truncate font-semibold">{item.title} <span className="text-muted font-normal">×{item.quantity}</span></span>
                    <span className="font-mono text-indigo-400 font-bold shrink-0">{formatCurrency(item.price * item.quantity)}</span>
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
