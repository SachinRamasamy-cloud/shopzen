import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/index.js';
import { formatDate, debounce, cn } from '../../utils/index.js';
import { PageLoader, Badge, Pagination } from '../../components/ui/index.jsx';
import { QUERY_KEYS } from '../../constants/index.js';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

const ROLES = ['', 'user', 'vendor', 'delivery', 'admin'];

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [page, setPage]     = useState(1);
  const [role, setRole]     = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_USERS, page, role, search],
    queryFn:  () => adminApi.getUsers({ page, limit: 20, role: role || undefined, search: search || undefined }),
    select:   r => r.data.data,
    keepPreviousData: true,
  });

  const toggle = useMutation({
    mutationFn: adminApi.toggleUser,
    onSuccess: () => { qc.invalidateQueries([QUERY_KEYS.ADMIN_USERS]); toast.success('User status updated'); },
  });

  const debouncedSearch = debounce(setSearch, 400);

  const roleBadge = { user: 'user', vendor: 'vendor', delivery: 'delivery', admin: 'admin' };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">User Accounts</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Review user roles, verification levels, and enable/disable states</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <input placeholder="Search name or email…" onChange={e => debouncedSearch(e.target.value)}
          className="input max-w-xs" />
        <div className="flex flex-wrap gap-1 bg-surface/30 border border-border/80 p-1 rounded-xl">
          {ROLES.map(r => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all',
                role === r ? 'bg-primary text-white shadow-glow-primary' : 'hover:bg-primary/10 hover:text-ink text-subtle')}>
              {r || 'All Roles'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-tag/30">
                  {['User Profile', 'Role Group', 'Verified', 'Active State', 'Joined Date', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 font-mono text-[9px] font-bold tracking-wider uppercase text-muted/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data?.users?.map(u => (
                  <tr key={u._id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-ink">{u.name}</div>
                      <div className="text-[10px] text-muted/70 font-mono mt-0.5">{u.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={roleBadge[u.role]} className="text-[9px] uppercase font-mono tracking-wider">{u.role}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('font-mono font-bold text-[10px] px-2 py-0.5 rounded-md border',
                        u.isEmailVerified ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20')}>
                        {u.isEmailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={u.isActive ? 'success' : 'danger'} className="text-[9px] uppercase font-mono tracking-wider">{u.isActive ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td className="px-5 py-4 text-muted/80 font-mono text-[10px]">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <Button size="sm" variant={u.isActive ? 'outline' : 'primary'}
                        onClick={() => toggle.mutate(u._id)} loading={toggle.isPending} className="rounded-xl">
                        {u.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.users?.length && (
              <div className="text-center py-16 text-muted/70 text-xs">No users matching current filters found</div>
            )}
          </div>
          <Pagination page={page} pages={Math.ceil((data?.total || 0) / 20)} onChange={setPage} />
        </>
      )}
    </div>
  );
}
