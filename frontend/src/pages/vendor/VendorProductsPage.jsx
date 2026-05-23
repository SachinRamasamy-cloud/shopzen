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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">Products</h1>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setFiles([]); setModal('create'); }}>
          + Add Product
        </Button>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          <div className="bg-surface border border-border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-tag">
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 font-mono text-[10px] font-semibold tracking-widest uppercase text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.products?.map(p => (
                  <tr key={p._id} className="hover:bg-tag/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-tag rounded border border-border overflow-hidden flex-shrink-0">
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-muted text-xs">□</div>}
                        </div>
                        <div>
                          <div className="font-medium text-ink line-clamp-1 max-w-[180px]">{p.title}</div>
                          <div className="font-mono text-[10px] text-muted">{p.sku || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-subtle text-xs">{p.category}</td>
                    <td className="px-4 py-3 font-mono text-xs">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('font-mono text-xs font-semibold', p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-green-600')}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.isActive ? 'success' : 'danger'}>{p.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="text-xs text-subtle hover:text-ink transition-colors">Edit</button>
                        <button onClick={() => openStock(p)} className="text-xs text-subtle hover:text-ink transition-colors">Stock</button>
                        <button onClick={() => deleteMutation.mutate(p._id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.products?.length && (
              <div className="text-center py-12 text-subtle text-sm">No products yet. Add your first product.</div>
            )}
          </div>
          <Pagination page={page} pages={Math.ceil((data?.total || 0) / 15)} onChange={setPage} />
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modal === 'create' || modal === 'edit'}
        onClose={() => { setModal(null); setEditing(null); }}
        title={editing ? 'Edit Product' : 'New Product'}
        width="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => { setModal(null); setEditing(null); }}>Cancel</Button>
            <Button onClick={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Save Changes' : 'Create Product'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Title *"       value={form.title}       onChange={e => set('title', e.target.value)}       className="col-span-2" />
          <div className="col-span-2">
            <label className="label">Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Describe your product…"
              className="input resize-none" />
          </div>
          <div>
            <label className="label">Category *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input appearance-none">
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Tags"          value={form.tags}        onChange={e => set('tags', e.target.value)}         placeholder="comma, separated" />
          <Input label="Price (₹) *"   value={form.price}       onChange={e => set('price', e.target.value)}        type="number" min="0" />
          <Input label="Compare Price" value={form.comparePrice} onChange={e => set('comparePrice', e.target.value)} type="number" min="0" />
          <Input label="Stock *"       value={form.stock}       onChange={e => set('stock', e.target.value)}         type="number" min="0" className="col-span-2" />
          <div className="col-span-2">
            <label className="label">Images</label>
            <input type="file" multiple accept="image/*"
              onChange={e => setFiles(Array.from(e.target.files))}
              className="text-xs text-subtle file:mr-3 file:py-1.5 file:px-3 file:border file:border-border file:rounded file:text-xs file:bg-tag file:text-ink hover:file:bg-ink hover:file:text-white file:transition-colors cursor-pointer" />
            {files.length > 0 && <p className="text-xs text-muted mt-1">{files.length} file(s) selected</p>}
          </div>
        </div>
      </Modal>

      {/* Stock Modal */}
      <Modal
        open={modal === 'stock'}
        onClose={() => { setModal(null); setEditing(null); }}
        title={`Update Stock — ${editing?.title}`}
        width="max-w-sm"
        footer={
          <>
            <Button variant="outline" onClick={() => { setModal(null); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => stockMutation.mutate({ id: editing._id, stock: Number(stockVal) })}
              loading={stockMutation.isPending}>Save</Button>
          </>
        }
      >
        <Input label="New Stock Quantity" type="number" min="0" value={stockVal} onChange={e => setStockVal(e.target.value)} />
      </Modal>
    </div>
  );
}
