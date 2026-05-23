import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice.js';
import { formatDate } from '../../utils/index.js';
import { Badge } from '../../components/ui/index.jsx';

const roleBadge = { user: 'user', vendor: 'vendor', delivery: 'delivery', admin: 'admin' };

export default function ProfilePage() {
  const user = useSelector(selectUser);
  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">User Profile</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Manage your account information and preferences</p>
      </div>

      <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
        <div className="px-5 py-5 border-b border-border/60 bg-tag/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center font-extrabold text-xl shadow-glow-primary">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-heading font-bold text-ink text-base">{user.name}</div>
              <div className="text-xs text-muted/80 font-mono mt-0.5">{user.email}</div>
            </div>
            <Badge variant={roleBadge[user.role]} className="ml-auto rounded-full px-3 py-1 font-mono uppercase tracking-wider text-[9px]">
              {user.role}
            </Badge>
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {[
            { label: 'Name',       value: user.name },
            { label: 'Email Address', value: user.email },
            { label: 'Role Privilege', value: user.role },
            { label: 'Email Verified', value: user.isEmailVerified ? 'Verified' : 'Unverified' },
            { label: 'Joined On',   value: user.createdAt ? formatDate(user.createdAt) : '—' },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center px-5 py-4 text-xs font-medium">
              <span className="text-muted/85 font-mono text-[10px] uppercase tracking-wider">{row.label}</span>
              <span className="text-ink font-heading font-semibold capitalize">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface/20 border border-border/80 rounded-2xl p-6 shadow-glass space-y-4">
        <div>
          <h2 className="font-heading text-sm font-bold text-ink">Saved Addresses</h2>
          <p className="text-[10px] font-mono text-muted uppercase tracking-wider mt-0.5">DEFAULT DELIVERY POINTS</p>
        </div>
        {user.addresses?.length ? (
          <div className="space-y-3">
            {user.addresses.map((a, i) => (
              <div key={i} className="text-xs text-subtle border border-border/80 rounded-xl p-4 bg-surface/30 space-y-1 hover:border-primary/50 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink">{a.label}</span>
                  {a.isDefault && <span className="text-[9px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 uppercase tracking-widest font-bold">Default</span>}
                </div>
                <div className="leading-relaxed text-subtle/90 font-medium">{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} — {a.pincode}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted/70 bg-surface/30 border border-border/80 rounded-xl p-5 text-center">No shipping addresses saved yet.</p>
        )}
      </div>
    </div>
  );
}
