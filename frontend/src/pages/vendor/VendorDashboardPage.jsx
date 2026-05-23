import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '../../api/index.js';
import { formatCurrency, formatDate, cn } from '../../utils/index.js';
import { StatCard, PageLoader, Badge } from '../../components/ui/index.jsx';
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
      label: 'Revenue',
      data:  rev.map(r => r.revenue),
      borderColor:     '#1a1917',
      backgroundColor: 'rgba(26,25,23,0.08)',
      tension: 0.3,
      pointRadius: 3,
    }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-subtle mt-0.5">Overview of your store performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue"   value={formatCurrency(data?.stats?.revenue || 0)} />
        <StatCard label="Total Orders"    value={data?.stats?.totalOrders || 0} />
        <StatCard label="Products"        value={data?.stats?.activeProducts || 0} sub={`${data?.stats?.totalProducts || 0} total`} />
        <StatCard label="Pending Orders"  value={data?.stats?.pendingOrders || 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-surface border border-border rounded p-5">
          <div className="font-mono text-xs font-semibold tracking-widest uppercase text-ink mb-4">Revenue Trend</div>
          {rev.length ? (
            <Line data={chartData} options={{
              responsive: true, maintainAspectRatio: true,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { grid: { color: '#ece9e3' } } },
            }} />
          ) : <div className="text-center py-12 text-subtle text-sm">No revenue data yet</div>}
        </div>

        {/* Low stock */}
        <div className="bg-surface border border-border rounded overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <div className="font-mono text-xs font-semibold tracking-widest uppercase text-ink">Low Stock Alerts</div>
          </div>
          <div className="divide-y divide-border">
            {data?.lowStockProducts?.length ? data.lowStockProducts.map(p => (
              <div key={p._id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-ink truncate">{p.title}</span>
                <span className={cn('font-mono text-xs font-semibold', p.stock === 0 ? 'text-red-600' : 'text-amber-600')}>
                  {p.stock === 0 ? 'Out' : `${p.stock} left`}
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-subtle text-sm">All products well-stocked</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-surface border border-border rounded overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <div className="font-mono text-xs font-semibold tracking-widest uppercase text-ink">Recent Orders</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-tag">
                {['Order', 'Customer', 'Date', 'Total', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-2.5 font-mono text-[10px] font-semibold tracking-widest uppercase text-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.recentOrders?.map(o => (
                <tr key={o._id} className="hover:bg-tag/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs">#{o._id.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3 text-subtle">{o.user?.name}</td>
                  <td className="px-5 py-3 text-subtle text-xs">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-3 font-mono">{formatCurrency(o.total)}</td>
                  <td className="px-5 py-3">
                    <span className={cn('font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border',
                      ORDER_STATUS[o.deliveryStatus]?.color)}>
                      {ORDER_STATUS[o.deliveryStatus]?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.recentOrders?.length && (
            <div className="text-center py-12 text-subtle text-sm">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
