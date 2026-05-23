import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../../api/orderApi.js';
import { formatCurrency, formatDate, cn } from '../../utils/index.js';
import { ORDER_STATUS, PAYMENT_STATUS, QUERY_KEYS } from '../../constants/index.js';
import { PageLoader, Badge, Pagination, Empty } from '../../components/ui/index.jsx';
import { onOrderUpdate, onDeliveryLocation } from '../../services/socket.js';
import toast from 'react-hot-toast';

export function OrdersPage() {
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (success) toast.success('Order placed successfully!');
  }, [success]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MY_ORDERS, page],
    queryFn:  () => orderApi.getMyOrders({ page, limit: 10 }),
    select:   r => r.data.data,
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink mb-6">My Orders</h1>
      {!data?.orders?.length ? (
        <Empty icon="⊡" title="No orders yet" description="Your orders will appear here after checkout."
          action={<Link to="/products" className="btn btn-primary">Shop Now</Link>}
        />
      ) : (
        <div className="space-y-4">
          {data.orders.map(order => (
            <div key={order._id} className="bg-surface border border-border rounded overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-tag flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-ink">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span className="text-xs text-muted">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border',
                    ORDER_STATUS[order.deliveryStatus]?.color || 'bg-tag border-border text-subtle')}>
                    {ORDER_STATUS[order.deliveryStatus]?.label || order.deliveryStatus}
                  </span>
                  <span className={cn('font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border',
                    PAYMENT_STATUS[order.paymentStatus]?.color || 'bg-tag border-border text-subtle')}>
                    {PAYMENT_STATUS[order.paymentStatus]?.label}
                  </span>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="flex gap-3">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-12 h-12 bg-tag rounded border border-border overflow-hidden">
                      {item.image
                        ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-muted text-lg">□</div>
                      }
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="w-12 h-12 bg-tag rounded border border-border flex items-center justify-center text-xs text-muted font-mono">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-semibold text-ink">{formatCurrency(order.total)}</span>
                  <Link to={`/tracking/${order._id}`}
                    className="text-xs border border-border px-3 py-1.5 rounded hover:bg-tag transition-colors">
                    Track →
                  </Link>
                </div>
              </div>
            </div>
          ))}
          <Pagination page={page} pages={Math.ceil((data?.total || 0) / 10)} onChange={setPage} />
        </div>
      )}
    </div>
  );
}

// ── Order Tracking Page ───────────────────────────────────
const STEPS = ['processing', 'packed', 'out_for_delivery', 'near_location', 'delivered'];

export function TrackingPage() {
  const { id } = useParams();
  const [liveStatus, setLiveStatus] = useState(null);
  const [coords, setCoords]         = useState(null);

  const { data: order, refetch } = useQuery({
    queryKey: [QUERY_KEYS.ORDER, id],
    queryFn:  () => orderApi.getOrder(id),
    select:   r => r.data.data.order,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const unsub1 = onOrderUpdate(({ orderId, status }) => {
      if (orderId === id) { setLiveStatus(status); refetch(); }
    });
    const unsub2 = onDeliveryLocation(({ orderId: oid, lat, lng }) => {
      if (oid === id) setCoords({ lat, lng });
    });
    return () => { unsub1(); unsub2(); };
  }, [id]);

  if (!order) return <PageLoader />;

  const currentStatus = liveStatus || order.deliveryStatus;
  const currentStep   = STEPS.indexOf(currentStatus);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-ink">
          Order #{order._id.slice(-8).toUpperCase()}
        </h1>
        <span className={cn('font-mono text-[10px] font-semibold px-2 py-1 rounded border',
          ORDER_STATUS[currentStatus]?.color)}>
          {ORDER_STATUS[currentStatus]?.label}
        </span>
      </div>

      {/* Progress stepper */}
      <div className="bg-surface border border-border rounded p-6 mb-6">
        <div className="relative">
          <div className="absolute top-3 left-0 right-0 h-px bg-border" />
          <div
            className="absolute top-3 left-0 h-px bg-ink transition-all duration-500"
            style={{ width: `${Math.max(0, currentStep / (STEPS.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center bg-surface text-xs font-mono font-bold transition-colors',
                  i <= currentStep ? 'border-ink bg-ink text-white' : 'border-border text-muted',
                )}>
                  {i <= currentStep ? '✓' : i + 1}
                </div>
                <span className={cn('text-[10px] text-center font-mono uppercase tracking-wide leading-tight max-w-[60px]',
                  i === currentStep ? 'text-ink font-semibold' : 'text-muted')}>
                  {ORDER_STATUS[step]?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live coords (simulated) */}
      {coords && (
        <div className="bg-surface border border-border rounded p-4 mb-6">
          <div className="font-mono text-xs text-muted uppercase tracking-widest mb-2">Live Location</div>
          <div className="font-mono text-sm text-ink">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </div>
        </div>
      )}

      {/* Tracking history */}
      <div className="bg-surface border border-border rounded overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-mono text-xs font-semibold tracking-widest uppercase text-ink">Tracking History</h2>
        </div>
        <div className="p-5 space-y-4">
          {[...(order.trackingHistory || [])].reverse().map((event, i) => (
            <div key={i} className={cn('flex gap-3', i === 0 ? 'text-ink' : 'text-subtle')}>
              <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0', i === 0 ? 'bg-ink' : 'bg-border')} />
              <div>
                <p className="text-sm font-medium leading-snug">{event.message}</p>
                <p className="font-mono text-xs text-muted mt-0.5">{formatDate(event.timestamp, { timeStyle: 'short', dateStyle: 'medium' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-surface border border-border rounded overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-mono text-xs font-semibold tracking-widest uppercase text-ink">Items</h2>
        </div>
        <div className="divide-y divide-border">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3">
              <div className="w-12 h-12 bg-tag rounded border border-border overflow-hidden flex-shrink-0">
                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover" /> :
                  <div className="w-full h-full flex items-center justify-center text-muted">□</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{item.title}</p>
                <p className="text-xs text-muted">×{item.quantity}</p>
              </div>
              <span className="font-mono text-sm">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-border bg-tag flex justify-between">
          <span className="font-medium text-sm">Total</span>
          <span className="font-mono font-semibold text-ink">{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
