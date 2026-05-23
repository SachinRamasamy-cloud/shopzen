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
    <div className="py-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Order History</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Review your purchases and trace deliveries</p>
      </div>

      {!data?.orders?.length ? (
        <Empty icon="📦" title="No orders found" description="You haven't placed any orders yet. Start shopping to fill your history."
          action={<Link to="/products" className="btn btn-primary">Browse Catalog</Link>}
        />
      ) : (
        <div className="space-y-5">
          {data.orders.map(order => (
            <div key={order._id} className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass hover:border-primary/45 transition-all">
              <div className="px-5 py-3 border-b border-border/60 bg-tag/35 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-ink">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <span className="text-xs text-muted/80">{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full border bg-tag text-subtle border-border',
                    ORDER_STATUS[order.deliveryStatus]?.color)}>
                    {ORDER_STATUS[order.deliveryStatus]?.label || order.deliveryStatus}
                  </span>
                  <span className={cn('font-mono text-[9px] font-semibold px-2 py-0.5 rounded-full border bg-tag text-subtle border-border',
                    PAYMENT_STATUS[order.paymentStatus]?.color)}>
                    {PAYMENT_STATUS[order.paymentStatus]?.label}
                  </span>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between gap-6">
                <div className="flex gap-3">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div key={i} className="w-12 h-12 bg-tag/30 rounded-xl border border-border/80 overflow-hidden flex items-center justify-center p-0.5">
                      {item.image
                        ? <img src={item.image} alt={item.title} className="w-full h-full object-contain rounded-lg" />
                        : <div className="w-full h-full flex items-center justify-center text-muted/50 text-base">□</div>
                      }
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="w-12 h-12 bg-tag/30 rounded-xl border border-border/80 flex items-center justify-center text-xs text-muted/80 font-mono font-bold">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-5">
                  <span className="font-heading font-extrabold text-sm text-indigo-400">{formatCurrency(order.total)}</span>
                  <Link to={`/tracking/${order._id}`}
                    className="px-4 py-2 text-xs font-semibold border border-border/80 hover:border-primary/50 rounded-xl bg-surface/50 hover:bg-tag transition-all">
                    Track Shipment &nbsp;→
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
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">
            Shipment Tracking
          </h1>
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Order Ref: #{order._id.slice(-8).toUpperCase()}</p>
        </div>
        <span className={cn('font-mono text-[10px] font-bold px-3 py-1 rounded-full border',
          ORDER_STATUS[currentStatus]?.color)}>
          {ORDER_STATUS[currentStatus]?.label}
        </span>
      </div>

      {/* Progress stepper */}
      <div className="bg-surface/20 border border-border/80 rounded-2xl p-6 shadow-glass">
        <div className="relative pt-2 pb-2">
          {/* Stepper track */}
          <div className="absolute top-[21px] left-3 right-3 h-[2px] bg-border/40" />
          <div
            className="absolute top-[21px] left-3 h-[2px] bg-primary transition-all duration-500 shadow-glow-primary"
            style={{ width: `${Math.max(0, currentStep / (STEPS.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center bg-surface text-xs font-mono font-bold transition-all',
                  i <= currentStep ? 'border-primary bg-primary text-white shadow-glow-primary scale-105' : 'border-border/80 text-muted/60',
                )}>
                  {i <= currentStep ? '✓' : i + 1}
                </div>
                <span className={cn('text-[9px] text-center font-mono uppercase tracking-wider leading-tight max-w-[80px]',
                  i === currentStep ? 'text-indigo-400 font-bold' : 'text-muted/70')}>
                  {ORDER_STATUS[step]?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live coords (simulated) */}
      {coords && (
        <div className="bg-surface/20 border border-border/80 rounded-2xl p-5 shadow-glass space-y-2">
          <div className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest">GPS Live Location</div>
          <div className="font-mono text-sm text-ink font-bold">
            緯度 {coords.lat.toFixed(6)} &nbsp; 経度 {coords.lng.toFixed(6)}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Tracking history */}
        <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
          <div className="px-5 py-4 border-b border-border/60 bg-tag/20">
            <h2 className="font-heading text-sm font-bold text-ink">Tracking Logs</h2>
          </div>
          <div className="p-5 space-y-6 max-h-[350px] overflow-y-auto pr-1">
            {[...(order.trackingHistory || [])].reverse().map((event, i) => (
              <div key={i} className={cn('flex gap-3', i === 0 ? 'text-ink' : 'text-subtle/80')}>
                <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0', i === 0 ? 'bg-primary shadow-glow-primary' : 'bg-border/70')} />
                <div className="space-y-1">
                  <p className="text-xs font-semibold leading-relaxed">{event.message}</p>
                  <p className="font-mono text-[9px] text-muted/70">{formatDate(event.timestamp, { timeStyle: 'short', dateStyle: 'medium' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order items */}
        <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
          <div className="px-5 py-4 border-b border-border/60 bg-tag/20">
            <h2 className="font-heading text-sm font-bold text-ink">Package Details</h2>
          </div>
          <div className="divide-y divide-border/60 max-h-[300px] overflow-y-auto">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-12 h-12 bg-tag/30 rounded-xl border border-border/80 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                  {item.image ? <img src={item.image} alt="" className="w-full h-full object-contain rounded-lg" /> :
                    <div className="w-full h-full flex items-center justify-center text-muted/50 text-base">□</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink truncate">{item.title}</p>
                  <p className="text-[10px] font-mono text-muted/80 mt-0.5">Quantity: {item.quantity}</p>
                </div>
                <span className="font-mono text-xs text-ink/90 font-semibold shrink-0">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-border/60 bg-tag/35 flex justify-between items-center">
            <span className="font-heading font-bold text-xs text-ink">Grand Total</span>
            <span className="font-heading font-extrabold text-sm text-indigo-400">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
