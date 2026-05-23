import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/index.js';
import { formatCurrency, formatDate, cn } from '../../utils/index.js';
import { StatCard, PageLoader, Badge, Table } from '../../components/ui/index.jsx';
import { QUERY_KEYS } from '../../constants/index.js';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import toast from 'react-hot-toast';
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
      label: 'Orders',
      data:  opd.map(d => d.orders),
      backgroundColor: '#1a1917',
      borderRadius: 3,
    }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Platform Overview</h1>
        <p className="text-sm text-subtle mt-0.5">Real-time metrics across the platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Platform Revenue"  value={formatCurrency(data?.stats?.platformRevenue || 0)} />
        <StatCard label="Total Orders"      value={data?.stats?.totalOrders || 0} />
        <StatCard label="Active Users"      value={data?.stats?.totalUsers || 0} />
        <StatCard label="Active Vendors"    value={data?.stats?.totalVendors || 0} />
        <StatCard label="Total Products"    value={data?.stats?.totalProducts || 0} />
        <StatCard label="Pending Vendors"   value={data?.stats?.pendingVendors || 0} sub="Awaiting approval" />
        <StatCard label="Pending Delivery"  value={data?.stats?.pendingDelivery || 0} sub="Awaiting approval" />
      </div>

      <div className="bg-surface border border-border rounded p-5">
        <div className="font-mono text-xs font-semibold tracking-widest uppercase text-ink mb-4">Orders (Last 30 Days)</div>
        {opd.length ? (
          <Bar data={chartData} options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false } }, y: { grid: { color: '#ece9e3' } } },
          }} />
        ) : <div className="text-center py-12 text-subtle text-sm">No order data yet</div>}
      </div>
    </div>
  );
}
