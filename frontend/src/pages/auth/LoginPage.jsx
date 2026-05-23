import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authApi } from '../../api/authApi.js';
import { setCredentials } from '../../features/auth/authSlice.js';
import { connectSocket } from '../../services/socket.js';
import { getErrMsg } from '../../utils/index.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';
import { ROLES } from '../../constants/index.js';

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      dispatch(setCredentials(data.data));
      connectSocket();
      toast.success('Welcome back!');
      const role = data.data.user.role;
      const redirects = {
        [ROLES.ADMIN]:    '/admin/dashboard',
        [ROLES.VENDOR]:   '/vendor/dashboard',
        [ROLES.DELIVERY]: '/delivery/dashboard',
      };
      navigate(redirects[role] || from, { replace: true });
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-surface/25 backdrop-blur-lg border border-border/80 p-8 md:p-10 rounded-3xl shadow-glass space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="font-heading font-extrabold text-2xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            SHOPZEN
          </Link>
          <h1 className="mt-4 text-xl font-bold text-ink font-heading">Welcome Back</h1>
          <p className="text-xs text-muted/80 mt-1">Enter your details to access your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            error={errors.email}
            autoComplete="email"
          />
          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              error={errors.password}
              autoComplete="current-password"
            />
            <div className="flex justify-end">
              <Link to="/auth/forgot-password" className="text-[10px] font-mono uppercase tracking-wider text-muted hover:text-primary transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full btn-lg mt-2">
            Sign In
          </Button>
        </form>

        <div className="text-center text-xs text-subtle/90">
          New to ShopZen?{' '}
          <Link to="/auth/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
