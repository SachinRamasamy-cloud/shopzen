import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/index.js';
import { formatCurrency } from '../../utils/index.js';
import { StatCard, PageLoader } from '../../components/ui/index.jsx';
import { QUERY_KEYS } from '../../constants/index.js';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_DASHBOARD],
    queryFn:  () => adminApi.getDashboard(),
    select:   r => r.data.data,
  });

  if (isLoading) return <PageLoader />;

  const opd = data?.ordersPerDay || [];
  const chartData = {
    labels:   opd.map(d => d._id),
    datasets: [{
      label: 'Orders Processed',
      data:  opd.map(d => d.orders),
      backgroundColor: 'rgba(99, 102, 241, 0.85)',
      hoverBackgroundColor: '#a855f7',
      borderRadius: 6,
    }],
  };

  return (
    <div className="space-y-8 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Administration Hub</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Real-time metrics and platform metrics overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Platform Revenue"  value={formatCurrency(data?.stats?.platformRevenue || 0)} />
        <StatCard label="Total Orders"      value={data?.stats?.totalOrders || 0} />
        <StatCard label="Registered Users"      value={data?.stats?.totalUsers || 0} />
        <StatCard label="Active Merchants"    value={data?.stats?.totalVendors || 0} />
        <StatCard label="Listed Products"    value={data?.stats?.totalProducts || 0} />
        <StatCard label="Pending Merchants"   value={data?.stats?.pendingVendors || 0} sub="Awaiting validation" />
        <StatCard label="Pending Riders"  value={data?.stats?.pendingDelivery || 0} sub="Awaiting validation" />
      </div>

      <div className="bg-surface/20 border border-border/80 rounded-2xl p-6 shadow-glass space-y-4">
        <div className="font-heading text-sm font-bold text-ink">Orders Activity (Last 30 Days)</div>
        {opd.length ? (
          <div className="h-[260px] flex items-center">
            <Bar data={chartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: { color: 'rgba(245,244,255,0.5)', font: { size: 9, family: 'monospace' } } },
                y: { grid: { color: '#1b163d' }, ticks: { color: 'rgba(245,244,255,0.5)', font: { size: 9, family: 'monospace' } } }
              },
            }} />
          </div>
        ) : <div className="text-center py-16 text-muted/70 text-xs">No orders recorded in this time range</div>}
      </div>
    </div>
  );
}
