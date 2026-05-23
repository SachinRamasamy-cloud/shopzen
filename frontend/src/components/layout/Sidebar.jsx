import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/index.js';

export default function Sidebar({ title, subtitle, links }) {
  return (
    <aside className="w-56 flex-shrink-0 bg-surface/30 backdrop-blur-md border-r border-border/85 min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 py-6 border-b border-border/70">
        <div className="font-heading text-sm font-bold tracking-wide text-ink">{title}</div>
        {subtitle && <div className="text-[11px] text-muted mt-1 font-mono uppercase tracking-wider">{subtitle}</div>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {links.map((group, gi) => (
          <div key={gi} className="mb-6">
            {group.label && (
              <div className="px-5 py-1.5 font-mono text-[9px] font-semibold tracking-wider uppercase text-muted/70">
                {group.label}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-5 py-2.5 text-xs transition-all border-l-2 font-medium',
                  isActive
                    ? 'border-primary text-ink bg-primary/10 shadow-[inset_1px_0_0_0_rgba(99,102,241,0.2)]'
                    : 'border-transparent text-subtle hover:text-ink hover:bg-primary/5',
                )}
              >
                {item.icon && <span className="text-base leading-none opacity-85">{item.icon}</span>}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
