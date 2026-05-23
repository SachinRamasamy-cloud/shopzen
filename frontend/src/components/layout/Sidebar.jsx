import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/index.js';

export default function Sidebar({ title, subtitle, links }) {
  return (
    <aside className="w-52 flex-shrink-0 bg-surface border-r border-border min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-4 py-5 border-b border-border">
        <div className="font-mono text-xs font-bold tracking-widest uppercase text-ink">{title}</div>
        {subtitle && <div className="text-xs text-muted mt-0.5">{subtitle}</div>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-2">
        {links.map((group, gi) => (
          <div key={gi} className="mb-4">
            {group.label && (
              <div className="px-4 py-1.5 font-mono text-[9px] font-semibold tracking-widest uppercase text-muted">
                {group.label}
              </div>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => cn(
                  'flex items-center gap-2.5 px-4 py-2 text-sm transition-colors border-l-2',
                  isActive
                    ? 'border-ink text-ink bg-tag font-medium'
                    : 'border-transparent text-subtle hover:text-ink hover:bg-tag/50',
                )}
              >
                {item.icon && <span className="text-base leading-none">{item.icon}</span>}
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
