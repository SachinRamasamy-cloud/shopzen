import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice.js';
import { formatDate } from '../../utils/index.js';
import { Badge } from '../../components/ui/index.jsx';

const roleBadge = { user: 'user', vendor: 'vendor', delivery: 'delivery', admin: 'admin' };

export default function ProfilePage() {
  const user = useSelector(selectUser);
  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-ink">Profile</h1>

      <div className="bg-surface border border-border rounded overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-tag">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-ink text-white flex items-center justify-center font-semibold text-lg">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-ink">{user.name}</div>
              <div className="text-xs text-muted">{user.email}</div>
            </div>
            <Badge variant={roleBadge[user.role]} className="ml-auto">{user.role}</Badge>
          </div>
        </div>

        <div className="divide-y divide-border">
          {[
            { label: 'Name',       value: user.name },
            { label: 'Email',      value: user.email },
            { label: 'Role',       value: user.role },
            { label: 'Verified',   value: user.isEmailVerified ? 'Yes' : 'No' },
            { label: 'Member Since', value: user.createdAt ? formatDate(user.createdAt) : '—' },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center px-5 py-3 text-sm">
              <span className="text-muted font-mono text-xs uppercase tracking-wider">{row.label}</span>
              <span className="text-ink capitalize">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded p-5">
        <div className="font-mono text-xs font-semibold tracking-widest uppercase text-ink mb-3">Addresses</div>
        {user.addresses?.length ? (
          <div className="space-y-3">
            {user.addresses.map((a, i) => (
              <div key={i} className="text-sm text-subtle border border-border rounded p-3">
                <span className="font-medium text-ink">{a.label}</span>{a.isDefault && <span className="ml-2 text-xs text-muted">(Default)</span>}
                <div className="mt-1">{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} — {a.pincode}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-subtle">No addresses saved yet.</p>
        )}
      </div>
    </div>
  );
}
