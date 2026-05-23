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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Delivery Dashboard</h1>
          <p className="text-sm text-subtle mt-0.5">Manage your deliveries</p>
        </div>
        <Button
          variant={data?.partner?.isOnline ? 'outline' : 'primary'}
          onClick={() => toggleOnline.mutate()}
          loading={toggleOnline.isPending}
        >
          {data?.partner?.isOnline ? '● Online' : '○ Go Online'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Deliveries" value={data?.stats?.totalDeliveries || 0} />
        <StatCard label="Total Earnings"   value={formatCurrency(data?.stats?.totalEarnings || 0)} />
      </div>

      {/* Live coords */}
      {coords && (
        <div className="bg-surface border border-border rounded p-4">
          <div className="font-mono text-xs text-muted uppercase tracking-widest mb-1">Live Position</div>
          <div className="font-mono text-sm text-ink">{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</div>
          <div className="flex gap-1 mt-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={cn('h-1 flex-1 rounded', simulating ? 'bg-ink animate-pulse' : 'bg-border')} />
            ))}
          </div>
        </div>
      )}

      {/* Assigned orders */}
      <div className="bg-surface border border-border rounded overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="font-mono text-xs font-semibold tracking-widest uppercase text-ink">Active Deliveries</div>
          <Badge variant={data?.partner?.isOnline ? 'success' : 'default'}>
            {data?.partner?.isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <div className="divide-y divide-border">
          {data?.assignedOrders?.map(order => (
            <div key={order._id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-xs font-semibold text-ink">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                  <div className="text-xs text-subtle mt-0.5">
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}
                  </div>
                </div>
                <span className={cn('font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border',
                  ORDER_STATUS[order.deliveryStatus]?.color)}>
                  {ORDER_STATUS[order.deliveryStatus]?.label}
                </span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline"
                  onClick={() => handleSimulate(order)} disabled={simulating}>
                  {simulating ? 'Simulating…' : 'Simulate GPS'}
                </Button>
                <Button size="sm"
                  onClick={() => complete.mutate(order._id)}
                  loading={complete.isPending}>
                  Mark Delivered
                </Button>
              </div>
            </div>
          ))}
          {!data?.assignedOrders?.length && (
            <div className="text-center py-12 text-subtle text-sm">
              {data?.partner?.isOnline ? 'No active deliveries' : 'Go online to receive orders'}
            </div>
          )}
        </div>
      </div>

      {/* Recent history */}
      {data?.recentDeliveries?.length > 0 && (
        <div className="bg-surface border border-border rounded overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <div className="font-mono text-xs font-semibold tracking-widest uppercase text-ink">Recent Deliveries</div>
          </div>
          <div className="divide-y divide-border">
            {data.recentDeliveries.map(o => (
              <div key={o._id} className="flex items-center justify-between px-5 py-3">
                <span className="font-mono text-xs text-ink">#{o._id.slice(-6).toUpperCase()}</span>
                <span className="text-xs text-subtle">{formatDate(o.deliveredAt)}</span>
                <span className="font-mono text-xs text-green-600 font-semibold">₹50</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
