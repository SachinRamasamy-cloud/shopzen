import { forwardRef } from 'react';
import { cn } from '../../utils/index.js';

const Input = forwardRef(({ label, error, hint, className, ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="label">{label}</label>}
    <input
      ref={ref}
      className={cn(
        'w-full px-3 py-2 text-sm bg-surface border rounded placeholder:text-muted',
        'focus:outline-none transition-colors',
        error ? 'border-red-400 focus:border-red-500' : 'border-border focus:border-ink',
        className,
      )}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
    {hint && !error && <span className="text-xs text-muted">{hint}</span>}
  </div>
));
Input.displayName = 'Input';
export default Input;
