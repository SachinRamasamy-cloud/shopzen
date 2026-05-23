import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuth } from '../features/auth/authSlice.js';

// Redirect to login if not authenticated
export function ProtectedRoute({ children }) {
  const isAuth   = useSelector(selectIsAuth);
  const location = useLocation();
  if (!isAuth) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  return children;
}

// Redirect if role doesn't match
export function RoleRoute({ roles, children }) {
  const user   = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuth);

  if (!isAuth) return <Navigate to="/auth/login" replace />;
  if (!roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
}

// Redirect logged-in users away from auth pages
export function GuestRoute({ children }) {
  const isAuth = useSelector(selectIsAuth);
  const user   = useSelector(selectUser);

  if (isAuth) {
    const redirects = { admin: '/admin/dashboard', vendor: '/vendor/dashboard', delivery: '/delivery/dashboard' };
    return <Navigate to={redirects[user?.role] || '/'} replace />;
  }
  return children;
}
