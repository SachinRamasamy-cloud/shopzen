import { cn } from '../../utils/index.js';

const variants = {
  primary: 'bg-ink text-white border-ink hover:bg-ink/90',
  outline: 'bg-transparent text-ink border-border hover:bg-tag',
  ghost:   'bg-transparent text-subtle border-transparent hover:bg-tag hover:text-ink',
  danger:  'bg-red-600 text-white border-red-600 hover:bg-red-700',
};
const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
};

export default function Button({
  variant = 'primary', size = 'md', loading = false,
  disabled, children, className, ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded border transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant], sizes[size], className,
      )}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
