import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/index.js';
import { formatDate, cn } from '../../utils/index.js';
import { Badge, PageLoader } from '../../components/ui/index.jsx';
import { QUERY_KEYS } from '../../constants/index.js';
import Button from '../../components/ui/Button.jsx';
import toast from 'react-hot-toast';

export default function AdminVendorsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_VENDORS, filter],
    queryFn:  () => adminApi.getVendors(filter !== 'all' ? { approved: filter === 'approved' } : {}),
    select:   r => r.data.data.vendors,
  });

  const approve = useMutation({
    mutationFn: adminApi.approveVendor,
    onSuccess: () => { qc.invalidateQueries([QUERY_KEYS.ADMIN_VENDORS]); toast.success('Vendor approved'); },
  });
  const reject = useMutation({
    mutationFn: adminApi.rejectVendor,
    onSuccess: () => { qc.invalidateQueries([QUERY_KEYS.ADMIN_VENDORS]); toast.success('Vendor rejected'); },
  });

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Merchant Directory</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Moderate multi-vendor merchant registrations and store validation states</p>
        </div>
        <div className="flex gap-1 bg-surface/30 border border-border/80 p-1 rounded-xl w-fit">
          {['all', 'pending', 'approved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all',
                filter === f ? 'bg-primary text-white shadow-glow-primary' : 'hover:bg-primary/10 hover:text-ink text-subtle')}>
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-tag/30">
                {['Store Identity', 'Merchant Owner', 'Joined Date', 'Validation Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 font-mono text-[9px] font-bold tracking-wider uppercase text-muted/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data?.map(v => (
                <tr key={v._id} className="hover:bg-surface/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-ink">{v.storeName}</div>
                    <div className="text-[10px] text-muted/70 font-mono mt-0.5">{v.storeSlug || 'N/A'}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-ink/95">{v.owner?.name}</div>
                    <div className="text-[10px] text-muted/75 font-mono mt-0.5">{v.owner?.email}</div>
                  </td>
                  <td className="px-5 py-4 text-muted/80 font-mono text-[10px]">{formatDate(v.createdAt)}</td>
                  <td className="px-5 py-4">
                    <Badge variant={v.isApproved ? 'success' : 'warning'} className="text-[9px] uppercase font-mono tracking-wider">
                      {v.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {!v.isApproved && (
                        <Button size="sm" onClick={() => approve.mutate(v._id)} loading={approve.isPending} className="rounded-xl">
                          Approve Store
                        </Button>
                      )}
                      {v.isApproved && (
                        <Button size="sm" variant="danger" onClick={() => reject.mutate(v._id)} loading={reject.isPending} className="rounded-xl bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white">
                          Revoke Access
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.length && (
            <div className="text-center py-16 text-muted/70 text-xs">No merchants found in this database view</div>
          )}
        </div>
      )}
    </div>
  );
}
