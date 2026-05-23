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
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Promotional Coupons</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Configure special discount rates and campaign vouchers</p>
        </div>
        <Button onClick={() => setModal(true)}>+ Create Coupon</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {coupons?.map(c => (
          <div key={c._id} className="bg-surface/20 border border-border/80 rounded-2xl p-5 flex items-center justify-between shadow-glass hover:border-primary/45 transition-all">
            <div className="space-y-2">
              <div className="font-heading font-extrabold text-lg text-indigo-400 tracking-widest bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20 w-fit">
                {c.code}
              </div>
              <div className="space-y-1">
                <div className="text-xs text-ink/90 font-semibold">
                  {c.type === 'percentage' ? `${c.discount}% Discount Rate` : `Flat ${c.discount} INR off`}
                  {c.minOrder > 0 && ` &middot; Min order ${formatCurrency(c.minOrder)}`}
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <Badge variant={c.isActive && new Date(c.expiresAt) > new Date() ? 'success' : 'danger'} className="text-[9px] uppercase tracking-wider font-mono">
                    {c.isActive && new Date(c.expiresAt) > new Date() ? 'Active' : 'Expired'}
                  </Badge>
                  <span className="font-mono text-[9px] text-muted/75 font-semibold">Used {c.totalUsed || 0}/{c.usageLimit * 100}</span>
                  <span className="font-mono text-[9px] text-muted/75 font-semibold">Expires {formatDate(c.expiresAt)}</span>
                </div>
              </div>
            </div>
            <button onClick={() => remove.mutate(c._id)} className="text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/25 px-3.5 py-2 rounded-xl transition-all self-start">
              Delete
            </button>
          </div>
        ))}
        {!coupons?.length && (
          <div className="bg-surface/20 border border-border/80 rounded-2xl py-16 text-center text-muted/70 text-xs md:col-span-2 shadow-glass">
            No promotional campaigns active yet. Create one to begin.
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Generate Coupon Code" width="max-w-md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleCreate} loading={create.isPending} className="rounded-xl">Create Coupon</Button>
          </>
        }>
        <div className="space-y-4">
          <Input label="Coupon Code *" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SUPER50" />
          <div className="space-y-1">
            <label className="label">Calculation Method *</label>
            <div className="relative">
              <select value={form.type} onChange={e => set('type', e.target.value)} className="input appearance-none pr-8">
                <option value="percentage" className="bg-bg">Percentage Discount (%)</option>
                <option value="flat" className="bg-bg">Flat Cash Discount (₹)</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none text-[10px]">▼</span>
            </div>
          </div>
          <Input label={`Discount Rate ${form.type === 'percentage' ? '(%)' : '(₹)'} *`} type="number" min="0"
            value={form.discount} onChange={e => set('discount', e.target.value)} />
          {form.type === 'percentage' && (
            <Input label="Maximum Cap (₹)" type="number" min="0" value={form.maxDiscount}
              onChange={e => set('maxDiscount', e.target.value)} hint="Maximum savings allowed" />
          )}
          <Input label="Minimum Purchase Requirement (₹)" type="number" min="0" value={form.minOrder}
            onChange={e => set('minOrder', e.target.value)} />
          <Input label="Total Redemptions Cap" type="number" min="1" value={form.usageLimit}
            onChange={e => set('usageLimit', e.target.value)} />
          <Input label="Expiration Date *" type="date" value={form.expiresAt}
            onChange={e => set('expiresAt', e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
