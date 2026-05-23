import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi.js';
import { getErrMsg, cn } from '../../utils/index.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'user',     label: 'Customer Account', desc: 'Discover unique products and checkout securely.' },
  { value: 'vendor',   label: 'Merchant Console', desc: 'List items, manage coupons, and scale business.' },
  { value: 'delivery', label: 'Delivery Rider',  desc: 'Fulfill shipments with flexible on-road maps.' },
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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-lg bg-surface/25 backdrop-blur-lg border border-border/80 p-8 md:p-10 rounded-3xl shadow-glass space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="font-heading font-extrabold text-2xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            SHOPZEN
          </Link>
          <h1 className="mt-4 text-xl font-bold text-ink font-heading">Create Account</h1>
          <p className="text-xs text-muted/80 mt-1">Get started with our secure marketplace platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Full Name" placeholder="John Doe" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} error={errors.name} />
          <Input label="Email Address" type="email" placeholder="name@example.com" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} error={errors.email} />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} error={errors.password}
            hint="At least 6 characters required" />

          {/* Role selector */}
          <div className="space-y-2">
            <label className="label">Account Type</label>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {ROLE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role: opt.value }))}
                  className={cn(
                    'text-left p-3 border rounded-xl transition-all h-full flex flex-col justify-between',
                    form.role === opt.value
                      ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.15)] scale-102'
                      : 'border-border/80 bg-surface/10 hover:border-primary/40 hover:bg-surface/20',
                  )}
                >
                  <div>
                    <div className="font-bold text-xs text-ink">{opt.label}</div>
                    <div className="text-[10px] text-muted/80 leading-normal mt-1">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full btn-lg pt-2">
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-subtle/90">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
