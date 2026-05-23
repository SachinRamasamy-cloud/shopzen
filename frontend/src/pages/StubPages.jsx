// Stub pages for routes not yet fully built

export function AdminReportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-ink">Reports</h1>
      <div className="bg-surface border border-border rounded p-10 text-center text-subtle text-sm">
        Platform-wide analytics reports — coming in Phase 6.
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-ink">Settings</h1>
      <div className="bg-surface border border-border rounded divide-y divide-border">
        {[
          { label: 'Commission Rate', desc: 'Platform-wide vendor commission percentage', value: '10%' },
          { label: 'Tax Rate',        desc: 'GST applied to all orders',                   value: '18%' },
          { label: 'Maintenance Mode', desc: 'Take the platform offline temporarily',      value: 'Off'  },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="font-medium text-sm text-ink">{s.label}</div>
              <div className="text-xs text-muted">{s.desc}</div>
            </div>
            <span className="font-mono text-sm text-subtle">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VendorAnalyticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-ink">Analytics</h1>
      <div className="bg-surface border border-border rounded p-10 text-center text-subtle text-sm">
        Detailed conversion tracking, funnel analytics — coming in Phase 5.
      </div>
    </div>
  );
}

export function DeliveryOrdersPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-ink">All Orders</h1>
      <div className="bg-surface border border-border rounded p-10 text-center text-subtle text-sm">
        Full order queue for delivery partners — coming next.
      </div>
    </div>
  );
}

export function DeliveryMapPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-ink">Map View</h1>
      <div className="bg-surface border border-border rounded p-10 text-center text-subtle text-sm">
        Live map with delivery route simulation — coming in Phase 4.
      </div>
    </div>
  );
}

export function DeliveryHistoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-ink">Delivery History</h1>
      <div className="bg-surface border border-border rounded p-10 text-center text-subtle text-sm">
        Completed deliveries and earnings history — coming next.
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <div className="font-mono text-6xl font-bold text-border mb-4">404</div>
        <h1 className="text-xl font-semibold text-ink mb-2">Page not found</h1>
        <p className="text-subtle mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn btn-primary inline-block px-5 py-2 bg-ink text-white rounded text-sm">
          Go Home
        </a>
      </div>
    </div>
  );
}
