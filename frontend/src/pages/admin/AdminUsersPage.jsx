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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Users <span className="text-subtle font-normal text-sm">({data?.total || 0})</span></h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input placeholder="Search name or email…" onChange={e => debouncedSearch(e.target.value)}
          className="input max-w-xs" />
        <div className="flex gap-1">
          {ROLES.map(r => (
            <button key={r} onClick={() => { setRole(r); setPage(1); }}
              className={cn('px-3 py-1.5 text-xs border rounded capitalize transition-colors',
                role === r ? 'bg-ink text-white border-ink' : 'border-border hover:bg-tag')}>
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <div className="bg-surface border border-border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-tag">
                  {['User', 'Role', 'Verified', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] font-semibold tracking-widest uppercase text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.users?.map(u => (
                  <tr key={u._id} className="hover:bg-tag/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{u.name}</div>
                      <div className="text-xs text-muted">{u.email}</div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={roleBadge[u.role]}>{u.role}</Badge></td>
                    <td className="px-4 py-3">
                      <span className={cn('font-mono text-[10px]', u.isEmailVerified ? 'text-green-600' : 'text-amber-600')}>
                        {u.isEmailVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant={u.isActive ? 'outline' : 'primary'}
                        onClick={() => toggle.mutate(u._id)} loading={toggle.isPending}>
                        {u.isActive ? 'Disable' : 'Enable'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.users?.length && (
              <div className="text-center py-12 text-subtle text-sm">No users found</div>
            )}
          </div>
          <Pagination page={page} pages={Math.ceil((data?.total || 0) / 20)} onChange={setPage} />
        </>
      )}
    </div>
  );
}
