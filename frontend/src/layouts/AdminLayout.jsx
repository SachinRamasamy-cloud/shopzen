import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/layout/Sidebar.jsx';
import { logout, selectUser } from '../features/auth/authSlice.js';
import { disconnectSocket } from '../services/socket.js';

const links = [
  {
    label: 'Platform',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: '▦', end: true },
      { to: '/admin/reports',   label: 'Reports',   icon: '↗' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/users',    label: 'Users',    icon: '◯' },
      { to: '/admin/vendors',  label: 'Vendors',  icon: '⊟' },
      { to: '/admin/orders',   label: 'Orders',   icon: '⊡' },
      { to: '/admin/products', label: 'Products', icon: '□' },
    ],
  },
  {
    label: 'Config',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: '⚙' },
    ],
  },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector(selectUser);

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar title="Admin" subtitle={user?.name} links={links} />
      <div className="flex-1 flex flex-col">
        <header className="h-12 bg-surface border-b border-border flex items-center justify-between px-5">
          <span className="font-mono text-xs text-muted tracking-wider uppercase">Admin Console</span>
          <button onClick={handleLogout} className="text-xs text-muted hover:text-ink transition-colors">
            Logout
          </button>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
