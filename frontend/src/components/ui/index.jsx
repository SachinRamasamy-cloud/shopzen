import { useEffect, useRef } from 'react';
import { cn } from '../../utils/index.js';

// ── Card ──────────────────────────────────────────────────
export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-surface/25 backdrop-blur-md border border-border/80 rounded-2xl overflow-hidden shadow-glass', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('px-5 py-4 border-b border-border/60 flex items-center justify-between', className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

// ── Badge ─────────────────────────────────────────────────
const badgeVariants = {
  default:  'bg-tag/30 border-border/80 text-subtle',
  user:     'bg-indigo-500/10   border-indigo-500/20   text-indigo-300',
  vendor:   'bg-purple-500/10  border-purple-500/20  text-purple-300',
  delivery: 'bg-cyan-500/10  border-cyan-500/20  text-cyan-300',
  admin:    'bg-rose-500/10    border-rose-500/20    text-rose-300',
  success:  'bg-emerald-500/10  border-emerald-500/20  text-emerald-300',
  warning:  'bg-amber-500/10  border-amber-500/20  text-amber-300',
  danger:   'bg-rose-500/10    border-rose-500/20    text-rose-300',
  info:     'bg-sky-500/10   border-sky-500/20   text-sky-300',
};

export function Badge({ variant = 'default', className, children }) {
  return (
    <span className={cn(
      'inline-block font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border',
      badgeVariants[variant], className,
    )}>
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const s = { sm: 'w-3 h-3 border', md: 'w-5 h-5 border-2', lg: 'w-8 h-8 border-2' }[size];
  return (
    <span className={cn(s, 'border-primary border-t-transparent rounded-full animate-spin inline-block', className)} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48">
      <Spinner size="lg" />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────
export function Empty({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center bg-surface/10 border border-border/60 rounded-3xl p-6 shadow-glass">
      {icon && <div className="text-4xl text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]">{icon}</div>}
      <div className="space-y-1">
        <p className="font-heading font-bold text-sm text-ink">{title}</p>
        {description && <p className="text-xs text-subtle leading-relaxed max-w-sm mx-auto">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, width = 'max-w-lg' }) {
  const overlayRef = useRef();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={(e) => e.target === overlayRef.current && onClose?.()}
    >
      <div className={cn('bg-surface/90 backdrop-blur-xl border border-border/80 rounded-2xl w-full shadow-glass overflow-hidden animate-in fade-in zoom-in-95 duration-200', width)}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h3 className="font-heading font-bold text-sm text-ink">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border/60 bg-tag/15 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ── Select ────────────────────────────────────────────────
export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <select
          className={cn(
            'w-full px-3 py-2 text-sm bg-surface/30 border border-border/80 rounded-xl appearance-none cursor-pointer pr-8',
            'focus:outline-none transition-colors',
            error ? 'border-red-400 focus:border-red-500' : 'focus:border-primary',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60 pointer-events-none text-[10px]">▼</span>
      </div>
      {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────
export function Table({ columns, data, loading, emptyText = 'No data available' }) {
  return (
    <div className="overflow-x-auto bg-surface/10 border border-border/80 rounded-2xl shadow-glass">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border/60 bg-tag/30">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3 font-mono text-[9px] font-bold tracking-wider uppercase text-muted/70 whitespace-nowrap">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-16"><Spinner /></td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-16 text-muted/70">{emptyText}</td></tr>
          ) : data.map((row, i) => (
            <tr key={row._id || i} className="hover:bg-surface/20 transition-all duration-200">
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-subtle font-medium">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────
export function StatCard({ label, value, sub, className }) {
  return (
    <div className={cn('bg-surface/25 backdrop-blur-md border border-border/80 rounded-2xl p-5 shadow-glass hover:border-primary/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300', className)}>
      <div className="label mb-2 uppercase text-[9px] tracking-wider font-mono text-muted/80">{label}</div>
      <div className="font-heading font-extrabold text-2xl text-indigo-400">{value}</div>
      {sub && <div className="text-[10px] font-mono text-muted/70 mt-1">{sub}</div>}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3.5 py-2 text-xs font-semibold border border-border/80 rounded-xl hover:border-primary/50 hover:bg-tag/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >&larr; Prev</button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'px-3.5 py-2 text-xs font-semibold border rounded-xl transition-all',
            p === page
              ? 'bg-primary border-primary text-white shadow-glow-primary'
              : 'border-border/80 hover:border-primary/50 hover:bg-tag/30 text-subtle',
          )}
        >{p}</button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="px-3.5 py-2 text-xs font-semibold border border-border/80 rounded-xl hover:border-primary/50 hover:bg-tag/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >Next &rarr;</button>
    </div>
  );
}
