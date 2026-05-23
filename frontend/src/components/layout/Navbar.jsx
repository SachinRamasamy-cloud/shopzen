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
    <header className="bg-surface/70 backdrop-blur-xl border-b border-border/80 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="font-heading font-extrabold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 shrink-0">
          SHOPZEN
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-subtle">
          <Link to="/products" className="hover:text-ink transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full">Products</Link>
          {isAuth && user?.role === ROLES.USER && (
            <>
              <Link to="/orders"  className="hover:text-ink transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full">Orders</Link>
              <Link to="/profile" className="hover:text-ink transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full">Profile</Link>
            </>
          )}
          {dashLink && (
            <Link to={dashLink} className="hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all hover:after:w-full">Dashboard</Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          {(!isAuth || user?.role === ROLES.USER) && (
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-border/80 rounded-xl hover:border-primary/50 bg-surface/50 hover:bg-tag hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all"
            >
              <span className="text-subtle group-hover:text-ink">Cart</span>
              {cartCount > 0 && (
                <span className="font-mono text-xs font-bold bg-primary text-white px-1.5 py-0.5 rounded-md min-w-[20px] text-center">{cartCount}</span>
              )}
            </Link>
          )}

          {/* Notifications */}
          {isAuth && (
            <Link
              to="/profile"
              className="relative px-3.5 py-2 text-sm border border-border/80 rounded-xl hover:border-primary/50 bg-surface/50 hover:bg-tag transition-all"
            >
              <span>🔔</span>
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white rounded-full font-mono text-[9px] flex items-center justify-center shadow-glow-primary">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )}

          {isAuth ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs font-medium text-subtle truncate max-w-[120px]">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-semibold border border-border/80 rounded-xl hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
              >Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth/login" className="px-4 py-2 text-xs font-semibold border border-border/80 rounded-xl hover:border-primary/50 hover:bg-tag transition-all">Login</Link>
              <Link to="/auth/register" className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
