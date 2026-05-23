import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '../../api/index.js';
import { productApi } from '../../api/productApi.js';
import { formatCurrency, cn } from '../../utils/index.js';
import { PageLoader, Modal, Badge, Pagination } from '../../components/ui/index.jsx';
import { QUERY_KEYS, CATEGORIES } from '../../constants/index.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', description: '', category: '', price: '',
  comparePrice: '', stock: '', tags: '', variants: '',
};

export default function VendorProductsPage() {
  const qc = useQueryClient();
  const [page, setPage]       = useState(1);
  const [modal, setModal]     = useState(null); // null | 'create' | 'edit' | 'stock'
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [files, setFiles]     = useState([]);
  const [stockVal, setStockVal] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.VENDOR_PRODUCTS, page],
    queryFn:  () => vendorApi.getProducts({ page, limit: 15 }),
    select:   r => r.data.data,
  });

  const createMutation = useMutation({
    mutationFn: (fd) => productApi.create(fd),
    onSuccess: () => {
      qc.invalidateQueries([QUERY_KEYS.VENDOR_PRODUCTS]);
      toast.success('Product created');
      setModal(null); setForm(EMPTY_FORM); setFiles([]);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => productApi.update(id, fd),
    onSuccess: () => {
      qc.invalidateQueries([QUERY_KEYS.VENDOR_PRODUCTS]);
      toast.success('Product updated');
      setModal(null); setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => { qc.invalidateQueries([QUERY_KEYS.VENDOR_PRODUCTS]); toast.success('Product removed'); },
  });

  const stockMutation = useMutation({
    mutationFn: ({ id, stock }) => vendorApi.updateStock(id, { stock }),
    onSuccess: () => {
      qc.invalidateQueries([QUERY_KEYS.VENDOR_PRODUCTS]);
      toast.success('Stock updated'); setModal(null); setEditing(null);
    },
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const buildFormData = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
    files.forEach(f => fd.append('images', f));
    return fd;
  };

  const handleSubmit = () => {
    if (!form.title || !form.price || !form.category || !form.stock) {
      toast.error('Fill required fields'); return;
    }
    const fd = buildFormData();
    if (editing) updateMutation.mutate({ id: editing._id, fd });
    else createMutation.mutate(fd);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      title: product.title, description: product.description,
      category: product.category, price: product.price,
      comparePrice: product.comparePrice || '', stock: product.stock,
      tags: product.tags?.join(', ') || '', variants: '',
    });
    setModal('edit');
  };

  const openStock = (product) => {
    setEditing(product); setStockVal(String(product.stock)); setModal('stock');
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Product Inventory</h1>
          <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Manage and audit your listed catalog items</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setFiles([]); setModal('create'); }}>
          + Add Product
        </Button>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <div className="bg-surface/20 border border-border/80 rounded-2xl overflow-hidden shadow-glass">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-tag/30">
                  {['Product Details', 'Category', 'Base Price', 'Stock Level', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 font-mono text-[9px] font-bold tracking-wider uppercase text-muted/70">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data?.products?.map(p => (
                  <tr key={p._id} className="hover:bg-surface/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-tag/30 rounded-xl border border-border/80 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt="" className="w-full h-full object-contain rounded-lg" />
                            : <div className="w-full h-full flex items-center justify-center text-muted/50 text-xs">□</div>}
                        </div>
                        <div>
                          <div className="font-bold text-ink line-clamp-1 max-w-[200px]">{p.title}</div>
                          <div className="font-mono text-[9px] text-muted/70 mt-0.5">SKU: {p.sku?.toUpperCase() || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-subtle font-medium">{p.category}</td>
                    <td className="px-5 py-4 font-mono font-semibold text-indigo-400">{formatCurrency(p.price)}</td>
                    <td className="px-5 py-4">
                      <span className={cn('font-mono font-bold px-2 py-0.5 rounded-md text-[10px] border',
                        p.stock === 0 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                        p.stock <= 5 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                        'text-emerald-400 bg-emerald-500/10 border-emerald-500/20')}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={p.isActive ? 'success' : 'danger'} className="text-[9px] uppercase font-mono tracking-wider">{p.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <button onClick={() => openEdit(p)} className="text-xs font-semibold text-subtle hover:text-primary transition-colors">Edit</button>
                        <button onClick={() => openStock(p)} className="text-xs font-semibold text-subtle hover:text-primary transition-colors">Stock</button>
                        <button onClick={() => deleteMutation.mutate(p._id)} className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.products?.length && (
              <div className="text-center py-16 text-muted/70 text-xs">No products created yet. click above to add your first listing.</div>
            )}
          </div>
          <Pagination page={page} pages={Math.ceil((data?.total || 0) / 15)} onChange={setPage} />
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        onClose={() => { setModal(null); setEditing(null); }}
        title={editing ? 'Edit Catalog Product' : 'Register New Product'}
        width="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => { setModal(null); setEditing(null); }} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending} className="rounded-xl">
              {editing ? 'Save Changes' : 'Publish Product'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Title *"       value={form.title}       onChange={e => set('title', e.target.value)}       className="col-span-2" />
          <div className="col-span-2 space-y-1">
            <label className="label">Product Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Provide extensive details about specifications, materials, warranty..."
              className="input resize-none" />
          </div>
          <div>
            <label className="label">Category *</label>
            <div className="relative">
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input appearance-none pr-8">
                <option value="" className="bg-bg">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c} className="bg-bg">{c}</option>)}
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none text-[10px]">▼</span>
            </div>
          </div>
          <Input label="Tags (comma separated)"          value={form.tags}        onChange={e => set('tags', e.target.value)}         placeholder="electronics, gadget, mini" />
          <Input label="Selling Price (₹) *"   value={form.price}       onChange={e => set('price', e.target.value)}        type="number" min="0" />
          <Input label="Compare Price (₹)" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} type="number" min="0" />
          <Input label="Opening Inventory Stock *"       value={form.stock}       onChange={e => set('stock', e.target.value)}         type="number" min="0" className="col-span-2" />
          <div className="col-span-2 space-y-1.5">
            <label className="label">Product Media Files</label>
            <input type="file" multiple accept="image/*"
              onChange={e => setFiles(Array.from(e.target.files))}
              className="text-xs text-subtle file:mr-3.5 file:py-2 file:px-4 file:border file:border-primary/20 file:rounded-xl file:text-xs file:bg-primary/10 file:text-indigo-300 hover:file:bg-primary hover:file:text-white file:transition-all cursor-pointer" />
            {files.length > 0 && <p className="text-xs text-muted/80 mt-1 font-mono">{files.length} images queued for upload</p>}
          </div>
        </div>
      </Modal>

      {/* Stock Modal */}
      <Modal
        open={modal === 'stock'}
        onClose={() => { setModal(null); setEditing(null); }}
        title="Quick Inventory Adjust"
        width="max-w-sm"
        footer={
          <>
            <Button variant="outline" onClick={() => { setModal(null); setEditing(null); }} className="rounded-xl">Cancel</Button>
            <Button onClick={() => stockMutation.mutate({ id: editing._id, stock: Number(stockVal) })}
              loading={stockMutation.isPending} className="rounded-xl">Update Stock</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-subtle leading-relaxed">Modify current available quantities for <strong className="text-ink">{editing?.title}</strong>.</p>
          <Input label="New Quantity" type="number" min="0" value={stockVal} onChange={e => setStockVal(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
