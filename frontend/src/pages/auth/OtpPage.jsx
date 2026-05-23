// OTP Verification
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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/" className="font-mono font-bold text-xl tracking-tight text-ink">STORE</Link>
          <h1 className="mt-6 text-2xl font-semibold text-ink">Verify email</h1>
          <p className="text-sm text-subtle mt-1">
            Enter the 6-digit code sent to <strong>{state?.email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text" inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-mono font-semibold border border-border rounded focus:outline-none focus:border-ink transition-colors bg-surface"
              />
            ))}
          </div>
          <Button type="submit" loading={loading} className="w-full">Verify</Button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={resend} className="text-xs text-muted hover:text-ink transition-colors">
            Didn't receive a code? Resend
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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/" className="font-mono font-bold text-xl tracking-tight text-ink">STORE</Link>
          <h1 className="mt-6 text-2xl font-semibold text-ink">Reset password</h1>
          <p className="text-sm text-subtle mt-1">We'll send a reset link to your email.</p>
        </div>
        {sent ? (
          <div className="bg-green-50 border border-green-200 rounded p-4 text-sm text-green-700">
            Reset link sent to <strong>{email}</strong>. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="input" />
            </div>
            <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
          </form>
        )}
        <div className="mt-4 text-center">
          <Link to="/auth/login" className="text-xs text-muted hover:text-ink transition-colors">Back to login</Link>
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
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link to="/" className="font-mono font-bold text-xl tracking-tight text-ink">STORE</Link>
          <h1 className="mt-6 text-2xl font-semibold text-ink">New password</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters" className="input" />
          </div>
          <Button type="submit" loading={loading} className="w-full">Reset Password</Button>
        </form>
      </div>
    </div>
  );
}
