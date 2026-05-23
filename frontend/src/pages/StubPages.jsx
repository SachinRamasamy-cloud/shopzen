// Stub pages for routes not yet fully built

export function AdminReportsPage() {
  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Reports & Forecasts</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Platform-wide analytical dashboards and exports queue</p>
      </div>
      <div className="bg-surface/20 border border-border/80 rounded-2xl p-16 text-center text-muted/70 text-xs shadow-glass">
        Platform-wide analytics reports &mdash; coming in Phase 6.
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">System Parameters</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Configure baseline rules, rates, and platform flags</p>
      </div>
      <div className="bg-surface/20 border border-border/80 rounded-2xl divide-y divide-border/60 overflow-hidden shadow-glass">
        {[
          { label: 'Commission Rate', desc: 'Platform-wide vendor commission percentage', value: '10.00%' },
          { label: 'Tax Rate',        desc: 'GST percentage applied to active line items', value: '18.00%' },
          { label: 'Maintenance Mode', desc: 'Gracefully take the platform database offline', value: 'INACTIVE' },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between px-6 py-5 hover:bg-surface/20 transition-colors">
            <div>
              <div className="font-bold text-xs text-ink">{s.label}</div>
              <div className="text-[10px] text-muted/70 mt-1">{s.desc}</div>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VendorAnalyticsPage() {
  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Conversion & Funnels</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Advanced metrics, customer retention, and traffic logs</p>
      </div>
      <div className="bg-surface/20 border border-border/80 rounded-2xl p-16 text-center text-muted/70 text-xs shadow-glass">
        Detailed conversion tracking, funnel analytics &mdash; coming in Phase 5.
      </div>
    </div>
  );
}

export function DeliveryOrdersPage() {
  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Orders Log</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Full delivery queue of local and regional packages</p>
      </div>
      <div className="bg-surface/20 border border-border/80 rounded-2xl p-16 text-center text-muted/70 text-xs shadow-glass">
        Full order queue for delivery partners &mdash; coming next.
      </div>
    </div>
  );
}

export function DeliveryMapPage() {
  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Active Route Map</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Geolocated tracking view of active delivery coordinates</p>
      </div>
      <div className="bg-surface/20 border border-border/80 rounded-2xl p-16 text-center text-muted/70 text-xs shadow-glass">
        Live map with delivery route simulation &mdash; coming in Phase 4.
      </div>
    </div>
  );
}

export function DeliveryHistoryPage() {
  return (
    <div className="space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink font-heading">Fulfillment History</h1>
        <p className="text-xs font-mono uppercase tracking-wider text-muted mt-1">Logs of completed shipments and historical payouts</p>
      </div>
      <div className="bg-surface/20 border border-border/80 rounded-2xl p-16 text-center text-muted/70 text-xs shadow-glass">
        Completed deliveries and earnings history &mdash; coming next.
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md bg-surface/25 backdrop-blur-lg border border-border/80 p-8 md:p-10 rounded-3xl shadow-glass text-center space-y-6">
        <div>
          <div className="font-heading font-extrabold text-7xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 tracking-wider">
            404
          </div>
          <h1 className="mt-4 text-xl font-bold text-ink font-heading">Route Offline</h1>
          <p className="text-xs text-muted/80 mt-1 leading-relaxed">
            The virtual node or coordinate you are trying to query does not exist in the active store routing table.
          </p>
        </div>
        <div>
          <a href="/" className="btn btn-primary inline-block font-semibold rounded-xl text-xs px-5 py-3 tracking-wider uppercase">
            Return to Core
          </a>
        </div>
      </div>
    </div>
  );
}
