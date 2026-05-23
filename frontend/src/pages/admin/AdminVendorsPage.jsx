import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/index.js';
import { formatDate, cn } from '../../utils/index.js';
import { Table, Badge, PageLoader } from '../../components/ui/index.jsx';
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Vendors</h1>
        <div className="flex gap-1">
          {['all', 'pending', 'approved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 text-xs border rounded capitalize transition-colors',
                filter === f ? 'bg-ink text-white border-ink' : 'border-border hover:bg-tag')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="bg-surface border border-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-tag">
                {['Store', 'Owner', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-2.5 font-mono text-[10px] font-semibold tracking-widest uppercase text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.map(v => (
                <tr key={v._id} className="hover:bg-tag/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{v.storeName}</div>
                    <div className="text-xs text-muted">{v.storeSlug}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-subtle">{v.owner?.name}</div>
                    <div className="text-xs text-muted">{v.owner?.email}</div>
                  </td>
                  <td className="px-5 py-3 text-subtle text-xs">{formatDate(v.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={v.isApproved ? 'success' : 'warning'}>
                      {v.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {!v.isApproved && (
                        <Button size="sm" onClick={() => approve.mutate(v._id)} loading={approve.isPending}>
                          Approve
                        </Button>
                      )}
                      {v.isApproved && (
                        <Button size="sm" variant="danger" onClick={() => reject.mutate(v._id)} loading={reject.isPending}>
                          Revoke
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.length && (
            <div className="text-center py-12 text-subtle text-sm">No vendors found</div>
          )}
        </div>
      )}
    </div>
  );
}
