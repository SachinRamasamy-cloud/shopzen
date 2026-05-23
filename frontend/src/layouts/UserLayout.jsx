import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
