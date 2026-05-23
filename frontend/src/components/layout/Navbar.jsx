import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, selectIsAuth, logout } from '../../features/auth/authSlice.js';
import { selectCartCount } from '../../features/cart/cartSlice.js';
import { selectUnread } from '../../features/notifications/notificationsSlice.js';
import { disconnectSocket } from '../../services/socket.js';
import { ROLES } from '../../constants/index.js';

export default function Navbar() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const user       = useSelector(selectUser);
  const isAuth     = useSelector(selectIsAuth);
  const cartCount  = useSelector(selectCartCount);
  const unread     = useSelector(selectUnread);

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
    navigate('/auth/login');
  };

  const dashLink = {
    [ROLES.ADMIN]:    '/admin/dashboard',
    [ROLES.VENDOR]:   '/vendor/dashboard',
    [ROLES.DELIVERY]: '/delivery/dashboard',
  }[user?.role];

  return (
    <header className="bg-surface border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="font-mono font-bold text-sm tracking-tight text-ink shrink-0">
          STORE
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-5 text-sm text-subtle">
          <Link to="/products" className="hover:text-ink transition-colors">Products</Link>
          {isAuth && user?.role === ROLES.USER && (
            <>
              <Link to="/orders"  className="hover:text-ink transition-colors">Orders</Link>
              <Link to="/profile" className="hover:text-ink transition-colors">Profile</Link>
            </>
          )}
          {dashLink && (
            <Link to={dashLink} className="hover:text-ink transition-colors">Dashboard</Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          {(!isAuth || user?.role === ROLES.USER) && (
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded hover:bg-tag transition-colors"
            >
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="font-mono text-xs font-bold">{cartCount}</span>
              )}
            </Link>
          )}

          {/* Notifications */}
          {isAuth && (
            <Link
              to="/profile"
              className="relative px-3 py-1.5 text-sm border border-border rounded hover:bg-tag transition-colors"
            >
              <span>🔔</span>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-ink text-white rounded-full font-mono text-[9px] flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )}

          {isAuth ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-xs text-muted truncate max-w-[100px]">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs border border-border rounded hover:bg-tag transition-colors"
              >Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth/login"    className="px-3 py-1.5 text-xs border border-border rounded hover:bg-tag transition-colors">Login</Link>
              <Link to="/auth/register" className="px-3 py-1.5 text-xs bg-ink text-white border border-ink rounded hover:bg-ink/90 transition-colors">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
