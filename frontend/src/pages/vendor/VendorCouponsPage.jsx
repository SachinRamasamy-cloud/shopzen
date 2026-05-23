import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '../../api/index.js';
import { formatDate, cn } from '../../utils/index.js';
import { PageLoader, Modal, Badge } from '../../components/ui/index.jsx';
import { QUERY_KEYS } from '../../constants/index.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';

const EMPTY = { code: '', type: 'percentage', discount: '', minOrder: '', maxDiscount: '', usageLimit: '1', expiresAt: '' };

export default function VendorCouponsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState(EMPTY);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const { data: coupons, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.VENDOR_COUPONS],
    queryFn:  () => vendorApi.getCoupons(),
    select:   r => r.data.data.coupons,
  });

  const create = useMutation({
    mutationFn: vendorApi.createCoupon,
    onSuccess: () => { qc.invalidateQueries([QUERY_KEYS.VENDOR_COUPONS]); toast.success('Coupon created'); setModal(false); setForm(EMPTY); },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  const remove = useMutation({
    mutationFn: vendorApi.deleteCoupon,
    onSuccess: () => { qc.invalidateQueries([QUERY_KEYS.VENDOR_COUPONS]); toast.success('Coupon deleted'); },
  });

  const handleCreate = () => {
    if (!form.code || !form.discount || !form.expiresAt) { toast.error('Fill required fields'); return; }
    create.mutate({ ...form, discount: Number(form.discount), minOrder: Number(form.minOrder || 0), usageLimit: Number(form.usageLimit || 1) });
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Coupons</h1>
        <Button onClick={() => setModal(true)}>+ Create Coupon</Button>
      </div>

      <div className="grid gap-3">
        {coupons?.map(c => (
          <div key={c._id} className="bg-surface border border-border rounded p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="font-mono text-xl font-bold text-ink tracking-widest">{c.code}</div>
              <div>
                <div className="text-sm text-subtle">
                  {c.type === 'percentage' ? `${c.discount}% off` : `₹${c.discount} off`}
                  {c.minOrder > 0 && ` · Min order ₹${c.minOrder}`}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={c.isActive && new Date(c.expiresAt) > new Date() ? 'success' : 'danger'}>
                    {c.isActive && new Date(c.expiresAt) > new Date() ? 'Active' : 'Expired'}
                  </Badge>
                  <span className="font-mono text-[10px] text-muted">Used {c.totalUsed}/{c.usageLimit * 100}</span>
                  <span className="font-mono text-[10px] text-muted">Expires {formatDate(c.expiresAt)}</span>
                </div>
              </div>
            </div>
            <button onClick={() => remove.mutate(c._id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
              Delete
            </button>
          </div>
        ))}
        {!coupons?.length && (
          <div className="bg-surface border border-border rounded py-16 text-center text-subtle text-sm">
            No coupons yet. Create your first coupon.
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Create Coupon" width="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={create.isPending}>Create</Button>
          </>
        }>
        <div className="space-y-4">
          <Input label="Coupon Code *" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SAVE20" />
          <div>
            <label className="label">Type *</label>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="input appearance-none">
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
          </div>
          <Input label={`Discount ${form.type === 'percentage' ? '(%)' : '(₹)'} *`} type="number" min="0"
            value={form.discount} onChange={e => set('discount', e.target.value)} />
          {form.type === 'percentage' && (
            <Input label="Max Discount (₹)" type="number" min="0" value={form.maxDiscount}
              onChange={e => set('maxDiscount', e.target.value)} hint="Cap the discount amount" />
          )}
          <Input label="Minimum Order (₹)" type="number" min="0" value={form.minOrder}
            onChange={e => set('minOrder', e.target.value)} />
          <Input label="Usage Limit per User" type="number" min="1" value={form.usageLimit}
            onChange={e => set('usageLimit', e.target.value)} />
          <Input label="Expires At *" type="date" value={form.expiresAt}
            onChange={e => set('expiresAt', e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
