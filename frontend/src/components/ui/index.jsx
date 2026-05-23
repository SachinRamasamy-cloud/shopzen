import { useEffect, useRef } from 'react';
import { cn } from '../../utils/index.js';

// ── Card ──────────────────────────────────────────────────
export function Card({ className, children, ...props }) {
  return (
    <div className={cn('bg-surface border border-border rounded overflow-hidden', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('px-4 py-3 border-b border-border flex items-center justify-between', className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-4', className)}>{children}</div>;
}

// ── Badge ─────────────────────────────────────────────────
const badgeVariants = {
  default:  'bg-tag border-border text-subtle',
  user:     'bg-blue-50   border-blue-200   text-blue-700',
  vendor:   'bg-amber-50  border-amber-200  text-amber-700',
  delivery: 'bg-green-50  border-green-200  text-green-700',
  admin:    'bg-red-50    border-red-200    text-red-700',
  success:  'bg-green-50  border-green-200  text-green-700',
  warning:  'bg-amber-50  border-amber-200  text-amber-700',
  danger:   'bg-red-50    border-red-200    text-red-700',
  info:     'bg-blue-50   border-blue-200   text-blue-700',
};

export function Badge({ variant = 'default', className, children }) {
  return (
    <span className={cn(
      'inline-block font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border',
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
    <span className={cn(s, 'border-ink border-t-transparent rounded-full animate-spin inline-block', className)} />
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
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && <div className="text-3xl text-muted">{icon}</div>}
      <div>
        <p className="font-semibold text-ink">{title}</p>
        {description && <p className="text-sm text-subtle mt-1">{description}</p>}
      </div>
      {action}
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose?.()}
    >
      <div className={cn('bg-surface border border-border rounded w-full shadow-lg', width)}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors text-lg leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border bg-tag flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ── Select ────────────────────────────────────────────────
export function Select({ label, error, className, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="label">{label}</label>}
      <select
        className={cn(
          'w-full px-3 py-2 text-sm bg-surface border rounded appearance-none cursor-pointer',
          'focus:outline-none transition-colors',
          error ? 'border-red-400' : 'border-border focus:border-ink',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────
export function Table({ columns, data, loading, emptyText = 'No data' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-tag">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-4 py-2.5 font-mono text-[10px] font-semibold tracking-widest uppercase text-muted whitespace-nowrap">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-12"><Spinner /></td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-subtle">{emptyText}</td></tr>
          ) : data.map((row, i) => (
            <tr key={row._id || i} className="border-b border-border/60 hover:bg-tag/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-subtle">
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
    <div className={cn('bg-surface border border-border rounded p-5', className)}>
      <div className="label mb-2">{label}</div>
      <div className="font-mono text-2xl font-semibold text-ink">{value}</div>
      {sub && <div className="text-xs text-subtle mt-1">{sub}</div>}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-xs border border-border rounded hover:bg-tag disabled:opacity-40 disabled:cursor-not-allowed"
      >← Prev</button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            'px-3 py-1.5 text-xs border rounded',
            p === page ? 'bg-ink text-white border-ink' : 'border-border hover:bg-tag',
          )}
        >{p}</button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="px-3 py-1.5 text-xs border border-border rounded hover:bg-tag disabled:opacity-40 disabled:cursor-not-allowed"
      >Next →</button>
    </div>
  );
}
