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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="font-mono font-bold text-xl tracking-tight text-ink">STORE</Link>
          <h1 className="mt-6 text-2xl font-semibold text-ink">Sign in</h1>
          <p className="text-sm text-subtle mt-1">Welcome back. Enter your credentials.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            error={errors.email}
            autoComplete="email"
          />
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
            <Link to="/auth/forgot-password" className="text-xs text-muted hover:text-ink transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-subtle">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-ink font-medium hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
