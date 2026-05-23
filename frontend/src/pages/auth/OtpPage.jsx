import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authApi } from '../../api/authApi.js';
import { setCredentials } from '../../features/auth/authSlice.js';
import { connectSocket } from '../../services/socket.js';
import { getErrMsg } from '../../utils/index.js';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

export function VerifyOTPPage() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const [otp, setOtp]       = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const refs = Array.from({ length: 6 }, () => useRef());

  const handleChange = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otp];
    next[i] = v;
    setOtp(next);
    if (v && i < 5) refs[i + 1].current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const { data } = await authApi.verifyOTP({ userId: state?.userId, otp: code });
      dispatch(setCredentials(data.data));
      connectSocket();
      toast.success('Email verified!');
      navigate('/');
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    try {
      await authApi.resendOTP({ email: state?.email });
      toast.success('New code sent');
    } catch (err) { toast.error(getErrMsg(err)); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-surface/25 backdrop-blur-lg border border-border/80 p-8 md:p-10 rounded-3xl shadow-glass space-y-6">
        <div className="text-center">
          <Link to="/" className="font-heading font-extrabold text-2xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            SHOPZEN
          </Link>
          <h1 className="mt-4 text-xl font-bold text-ink font-heading">Verify Email</h1>
          <p className="text-xs text-muted/80 mt-1">
            Enter the 6-digit OTP code sent to <strong className="text-indigo-400 font-mono">{state?.email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 justify-center">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text" inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-mono font-bold border border-border/80 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-surface/40 text-ink"
              />
            ))}
          </div>
          <Button type="submit" loading={loading} className="w-full btn-lg">Verify OTP Code</Button>
        </form>

        <div className="text-center">
          <button onClick={resend} className="text-xs font-semibold text-muted hover:text-primary transition-colors bg-tag px-3.5 py-2 rounded-xl border border-border/80">
            Didn't receive code? Resend
          </button>
        </div>
      </div>
    </div>
  );
}

// Forgot Password
export function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-surface/25 backdrop-blur-lg border border-border/80 p-8 md:p-10 rounded-3xl shadow-glass space-y-6">
        <div className="text-center">
          <Link to="/" className="font-heading font-extrabold text-2xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            SHOPZEN
          </Link>
          <h1 className="mt-4 text-xl font-bold text-ink font-heading">Reset Password</h1>
          <p className="text-xs text-muted/80 mt-1">We'll send a password recovery link to your inbox</p>
        </div>
        {sent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-xs text-emerald-300 leading-relaxed text-center shadow-glass">
            Reset authorization link dispatched to <strong className="text-indigo-300 font-mono">{email}</strong>. Check spam or filters if not visible.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="label">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com" className="input" />
            </div>
            <Button type="submit" loading={loading} className="w-full btn-lg mt-2">Send Recovery Link</Button>
          </form>
        )}
        <div className="text-center">
          <Link to="/auth/login" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}

// Reset Password
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const token = new URLSearchParams(search).get('token');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Min 6 characters'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset. Please login.');
      navigate('/auth/login');
    } catch (err) { toast.error(getErrMsg(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-surface/25 backdrop-blur-lg border border-border/80 p-8 md:p-10 rounded-3xl shadow-glass space-y-6">
        <div className="text-center">
          <Link to="/" className="font-heading font-extrabold text-2xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            SHOPZEN
          </Link>
          <h1 className="mt-4 text-xl font-bold text-ink font-heading">New Credentials</h1>
          <p className="text-xs text-muted/80 mt-1">Set a new, secure password for your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="label">New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="input" />
          </div>
          <Button type="submit" loading={loading} className="w-full btn-lg mt-2">Update Password</Button>
        </form>
      </div>
    </div>
  );
}
