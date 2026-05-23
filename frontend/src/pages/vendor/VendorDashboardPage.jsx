import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '../../api/index.js';
import { formatCurrency, formatDate, cn } from '../../utils/index.js';
import { StatCard, PageLoader } from '../../components/ui/index.jsx';
import { ORDER_STATUS, QUERY_KEYS } from '../../constants/index.js';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export default function VendorDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.VENDOR_DASHBOARD],
    queryFn:  () => vendorApi.getDashboard(),
    select:   r => r.data.data,
  });

  if (isLoading) return <PageLoader />;

  const rev  = data?.revenueByMonth || [];
  const chartData = {
    labels:   rev.map(r => r._id),
    datasets: [{
      label: 'Monthly Revenue',
      data:  rev.map(r => r.revenue),
      borderColor:     '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#a855f7',
      fill: true,
    }],
  };

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Merchant Console</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Overview of your store's real-time performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Revenue"   value={formatCurrency(data?.stats?.revenue || 0)} />
        <StatCard label="Total Orders"    value={data?.stats?.totalOrders || 0} />
        <StatCard label="Active Items"    value={data?.stats?.activeProducts || 0} sub={`${data?.stats?.totalProducts || 0} total listed`} />
        <StatCard label="Pending Delivery"  value={data?.stats?.pendingOrders || 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-surface/20 border border-border/80 rounded-2xl p-6 shadow-glass space-y-4">
          <div className="font-heading text-sm font-bold text-ink">Revenue Trend</div>
          {rev.length ? (
            <div className="h-[220px] flex items-center">
              <Line data={chartData} options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: 'rgba(245,244,255,0.5)', font: { size: 9, family: 'monospace' } } },
                  y: { grid: { color: '#1b163d' }, ticks: { color: 'rgba(245,244,255,0.5)', font: { size: 9, family: 'monospace' } } }
                },
              }} />
            </div>
          ) : <div className="text-center py-16 text-muted/70 text-xs">No revenue data recorded yet</div>}
        </div>

        {/* Low stock */}
        <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass flex flex-col h-full">
          <div className="px-5 py-4 border-b border-border/60 bg-tag/20">
            <h2 className="font-heading text-sm font-bold text-ink">Low Stock Alerts</h2>
          </div>
          <div className="divide-y divide-border/60 overflow-y-auto flex-1">
            {data?.lowStockProducts?.length ? data.lowStockProducts.map(p => (
              <div key={p._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-surface/30 transition-colors">
                <span className="text-xs text-ink/90 font-semibold truncate max-w-[200px]">{p.title}</span>
                <span className={cn('font-mono text-xs font-bold px-2.5 py-1 rounded-lg border',
                  p.stock === 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20')}>
                  {p.stock === 0 ? 'Out of Stock' : `${p.stock} units left`}
                </span>
              </div>
            )) : (
              <div className="text-center py-16 text-muted/70 text-xs">All inventory lines well-stocked</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
        <div className="px-5 py-4 border-b border-border/60 bg-tag/20">
          <h2 className="font-heading text-sm font-bold text-ink">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-tag/30">
                {['Order Reference', 'Customer', 'Date/Time', 'Total Received', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 font-mono text-[9px] font-bold tracking-wider uppercase text-muted/70">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data?.recentOrders?.map(o => (
                <tr key={o._id} className="hover:bg-surface/20 transition-colors">
                  <td className="px-5 py-3.5 font-mono font-bold text-ink">#{o._id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3.5 text-subtle font-medium">{o.user?.name}</td>
                  <td className="px-5 py-3.5 text-muted/80 font-mono text-[10px]">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-3.5 font-heading font-bold text-indigo-400">{formatCurrency(o.total)}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn('font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border bg-tag text-subtle border-border',
                      ORDER_STATUS[o.deliveryStatus]?.color)}>
                      {ORDER_STATUS[o.deliveryStatus]?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.recentOrders?.length && (
            <div className="text-center py-16 text-muted/70 text-xs">No orders received yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
