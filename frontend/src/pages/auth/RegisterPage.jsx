import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { getErrMsg, cn } from '../../utils/index.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'user',     label: 'Customer',         desc: 'Browse and buy products'     },
  { value: 'vendor',   label: 'Vendor',            desc: 'Sell products on the platform' },
  { value: 'delivery', label: 'Delivery Partner',  desc: 'Handle order deliveries'     },
];

export default function RegisterPage() {
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email)                         e.email    = 'Email is required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      toast.success('Account created! Check your email for the verification code.');
      navigate('/auth/verify-otp', { state: { userId: data.data.userId, email: form.email } });
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/" className="font-mono font-bold text-xl tracking-tight text-ink">STORE</Link>
          <h1 className="mt-6 text-2xl font-semibold text-ink">Create account</h1>
          <p className="text-sm text-subtle mt-1">Join the platform today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" placeholder="John Doe" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} error={errors.name} />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} error={errors.email} />
          <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} error={errors.password}
            hint="At least 6 characters" />

          {/* Role selector */}
          <div>
            <label className="label">Account Type</label>
            <div className="space-y-2">
              {ROLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role: opt.value }))}
                  className={cn(
                    'w-full text-left px-3 py-2.5 border rounded transition-colors',
                    form.role === opt.value
                      ? 'border-ink bg-ink/5'
                      : 'border-border hover:border-ink/30',
                  )}
                >
                  <div className="font-medium text-sm text-ink">{opt.label}</div>
                  <div className="text-xs text-subtle">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-subtle">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-ink font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
