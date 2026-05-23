import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import UserLayout     from '../layouts/UserLayout.jsx';
import VendorLayout   from '../layouts/VendorLayout.jsx';
import AdminLayout    from '../layouts/AdminLayout.jsx';
import DeliveryLayout from '../layouts/DeliveryLayout.jsx';

// Route guards
import { ProtectedRoute, RoleRoute, GuestRoute } from './ProtectedRoute.jsx';

// Auth pages
import LoginPage    from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';
import { VerifyOTPPage, ForgotPasswordPage, ResetPasswordPage } from '../pages/auth/OtpPage.jsx';

// User pages
import HomePage          from '../pages/user/HomePage.jsx';
import ProductsPage      from '../pages/user/ProductsPage.jsx';
import ProductDetailPage from '../pages/user/ProductDetailPage.jsx';
import CartPage          from '../pages/user/CartPage.jsx';
import CheckoutPage      from '../pages/user/CheckoutPage.jsx';
import { OrdersPage, TrackingPage } from '../pages/user/OrdersPage.jsx';
import ProfilePage       from '../pages/user/ProfilePage.jsx';

// Vendor pages
import VendorDashboardPage from '../pages/vendor/VendorDashboardPage.jsx';
import VendorProductsPage  from '../pages/vendor/VendorProductsPage.jsx';
import VendorOrdersPage    from '../pages/vendor/VendorOrdersPage.jsx';
import VendorCouponsPage   from '../pages/vendor/VendorCouponsPage.jsx';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import AdminUsersPage     from '../pages/admin/AdminUsersPage.jsx';
import AdminVendorsPage   from '../pages/admin/AdminVendorsPage.jsx';
import AdminOrdersPage    from '../pages/admin/AdminOrdersPage.jsx';
import AdminProductsPage  from '../pages/admin/AdminProductsPage.jsx';

// Delivery pages
import DeliveryDashboardPage from '../pages/delivery/DeliveryDashboardPage.jsx';

// Stubs
import {
  AdminReportsPage, AdminSettingsPage, VendorAnalyticsPage,
  DeliveryOrdersPage, DeliveryMapPage, DeliveryHistoryPage, NotFoundPage,
} from '../pages/StubPages.jsx';

const router = createBrowserRouter([
  // ── Auth ────────────────────────────────────────────────
  {
    path: '/auth/login',
    element: <GuestRoute><LoginPage /></GuestRoute>,
  },
  {
    path: '/auth/register',
    element: <GuestRoute><RegisterPage /></GuestRoute>,
  },
  {
    path: '/auth/verify-otp',
    element: <VerifyOTPPage />,
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/auth/reset-password',
    element: <ResetPasswordPage />,
  },

  // ── User / Public ───────────────────────────────────────
  {
    element: <UserLayout />,
    children: [
      { path: '/',            element: <HomePage /> },
      { path: '/products',    element: <ProductsPage /> },
      { path: '/product/:id', element: <ProductDetailPage /> },
      { path: '/cart',        element: <CartPage /> },
      {
        path: '/checkout',
        element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>,
      },
      {
        path: '/orders',
        element: <ProtectedRoute><OrdersPage /></ProtectedRoute>,
      },
      {
        path: '/tracking/:id',
        element: <ProtectedRoute><TrackingPage /></ProtectedRoute>,
      },
      {
        path: '/profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
    ],
  },

  // ── Vendor ──────────────────────────────────────────────
  {
    element: <RoleRoute roles={['vendor', 'admin']}><VendorLayout /></RoleRoute>,
    children: [
      { path: '/vendor',              element: <Navigate to="/vendor/dashboard" replace /> },
      { path: '/vendor/dashboard',    element: <VendorDashboardPage /> },
      { path: '/vendor/products',     element: <VendorProductsPage /> },
      { path: '/vendor/orders',       element: <VendorOrdersPage /> },
      { path: '/vendor/coupons',      element: <VendorCouponsPage /> },
      { path: '/vendor/analytics',    element: <VendorAnalyticsPage /> },
    ],
  },

  // ── Admin ────────────────────────────────────────────────
  {
    element: <RoleRoute roles={['admin']}><AdminLayout /></RoleRoute>,
    children: [
      { path: '/admin',             element: <Navigate to="/admin/dashboard" replace /> },
      { path: '/admin/dashboard',   element: <AdminDashboardPage /> },
      { path: '/admin/users',       element: <AdminUsersPage /> },
      { path: '/admin/vendors',     element: <AdminVendorsPage /> },
      { path: '/admin/orders',      element: <AdminOrdersPage /> },
      { path: '/admin/products',    element: <AdminProductsPage /> },
      { path: '/admin/reports',     element: <AdminReportsPage /> },
      { path: '/admin/settings',    element: <AdminSettingsPage /> },
    ],
  },

  // ── Delivery ─────────────────────────────────────────────
  {
    element: <RoleRoute roles={['delivery']}><DeliveryLayout /></RoleRoute>,
    children: [
      { path: '/delivery',            element: <Navigate to="/delivery/dashboard" replace /> },
      { path: '/delivery/dashboard',  element: <DeliveryDashboardPage /> },
      { path: '/delivery/orders',     element: <DeliveryOrdersPage /> },
      { path: '/delivery/map',        element: <DeliveryMapPage /> },
      { path: '/delivery/history',    element: <DeliveryHistoryPage /> },
    ],
  },

  // ── 404 ──────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
