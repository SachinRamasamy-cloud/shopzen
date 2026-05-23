import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from '../../api/index.js';
import { formatCurrency, formatDate, cn } from '../../utils/index.js';
import { StatCard, PageLoader, Badge } from '../../components/ui/index.jsx';
import { ORDER_STATUS, QUERY_KEYS } from '../../constants/index.js';
import { emitLocationUpdate } from '../../services/socket.js';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

// Simulate GPS movement between two coords
const simulateDelivery = async (orderId, userId, setCoords) => {
  const start = { lat: 19.076, lng: 72.877 };
  const end   = { lat: 19.093, lng: 72.892 };
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const lat = start.lat + ((end.lat - start.lat) / steps) * i;
    const lng = start.lng + ((end.lng - start.lng) / steps) * i;
    setCoords({ lat, lng });
    emitLocationUpdate({ lat, lng, orderId, userId });
    await new Promise(r => setTimeout(r, 2000));
  }
};

export default function DeliveryDashboardPage() {
  const qc = useQueryClient();
  const [coords, setCoords] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DELIVERY_DASH],
    queryFn:  () => deliveryApi.getDashboard(),
    select:   r => r.data.data,
    refetchInterval: 30000,
  });

  const toggleOnline = useMutation({
    mutationFn: deliveryApi.toggleOnline,
    onSuccess: () => qc.invalidateQueries([QUERY_KEYS.DELIVERY_DASH]),
  });

  const accept = useMutation({
    mutationFn: (orderId) => deliveryApi.acceptOrder(orderId),
    onSuccess: () => { qc.invalidateQueries([QUERY_KEYS.DELIVERY_DASH]); toast.success('Order accepted'); },
  });

  const complete = useMutation({
    mutationFn: (orderId) => deliveryApi.completeOrder(orderId),
    onSuccess: () => { qc.invalidateQueries([QUERY_KEYS.DELIVERY_DASH]); toast.success('Delivery completed!'); },
  });

  const handleSimulate = async (order) => {
    setSimulating(true);
    await simulateDelivery(order._id, order.user, setCoords);
    setSimulating(false);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Delivery Console</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Manage incoming rider requests and route coordinates</p>
        </div>
        <Button
          variant={data?.partner?.isOnline ? 'outline' : 'primary'}
          onClick={() => toggleOnline.mutate()}
          loading={toggleOnline.isPending}
          className="rounded-xl"
        >
          {data?.partner?.isOnline ? '● Online Mode' : '○ Go Online'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <StatCard label="Completed Shipments" value={data?.stats?.totalDeliveries || 0} />
        <StatCard label="Total Earnings"   value={formatCurrency(data?.stats?.totalEarnings || 0)} />
      </div>

      {/* Live coords */}
      {coords && (
        <div className="bg-surface/20 border border-border/80 rounded-2xl p-5 shadow-glass space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold text-indigo-400 uppercase tracking-widest">GPS Satellites Feed</span>
            <span className="text-[10px] font-mono text-emerald-400 animate-pulse">● Active Simulation</span>
          </div>
          <div className="font-mono text-sm text-ink font-bold">
            LAT {coords.lat.toFixed(6)} &nbsp; LNG {coords.lng.toFixed(6)}
          </div>
          <div className="flex gap-1.5 pt-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={cn('h-1 flex-1 rounded-full', simulating ? 'bg-primary animate-pulse' : 'bg-border/60')} />
            ))}
          </div>
        </div>
      )}

      {/* Assigned orders */}
      <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
        <div className="px-5 py-4 border-b border-border/60 bg-tag/20 flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold text-ink">Active Deliveries</h2>
          <Badge variant={data?.partner?.isOnline ? 'success' : 'default'} className="text-[9px] uppercase font-mono tracking-wider">
            {data?.partner?.isOnline ? 'Rider Active' : 'Offline'}
          </Badge>
        </div>
        <div className="divide-y divide-border/60">
          {data?.assignedOrders?.map(order => (
            <div key={order._id} className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-ink">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <div className="text-xs text-subtle/90 font-semibold mt-1">
                    Destination: {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
                  </div>
                </div>
                <span className={cn('font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full border bg-tag text-subtle border-border',
                  ORDER_STATUS[order.deliveryStatus]?.color)}>
                  {ORDER_STATUS[order.deliveryStatus]?.label}
                </span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline"
                  onClick={() => handleSimulate(order)} disabled={simulating} className="rounded-xl">
                  {simulating ? 'Simulating Coordinates…' : 'Simulate GPS Route'}
                </Button>
                <Button size="sm"
                  onClick={() => complete.mutate(order._id)}
                  loading={complete.isPending} className="rounded-xl">
                  Mark Delivered
                </Button>
              </div>
            </div>
          ))}
          {!data?.assignedOrders?.length && (
            <div className="text-center py-16 text-muted/70 text-xs font-medium">
              {data?.partner?.isOnline ? 'No active delivery manifests assigned' : 'Go online to query incoming requests'}
            </div>
          )}
        </div>
      </div>

      {/* Recent history */}
      {data?.recentDeliveries?.length > 0 && (
        <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
          <div className="px-5 py-4 border-b border-border/60 bg-tag/20">
            <h2 className="font-heading text-sm font-bold text-ink">Recent Payouts Log</h2>
          </div>
          <div className="divide-y divide-border/60">
            {data.recentDeliveries.map(o => (
              <div key={o._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface/20 transition-colors">
                <span className="font-mono text-xs font-bold text-ink">#{o._id.slice(-6).toUpperCase()}</span>
                <span className="text-xs text-muted/80 font-mono">{formatDate(o.deliveredAt)}</span>
                <span className="font-mono text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">₹50.00</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
