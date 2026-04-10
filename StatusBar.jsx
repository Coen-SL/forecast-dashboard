import { useData } from '../../context/DataContext.jsx'

const STATUS_CONFIG = {
  loading:  { color: '#60A5FA', label: 'Laden...',         dot: true  },
  success:  { color: '#22C55E', label: 'Live — Sheets',    dot: true  },
  fallback: { color: '#E8B84B', label: 'Fallback data',    dot: false },
  error:    { color: '#EF4444', label: 'Verbindingsfout',  dot: false },
  idle:     { color: '#6B7280', label: 'Niet verbonden',   dot: false },
}

export function StatusBar() {
  const { status, lastFetch, isConnected, refresh, isLoading } = useData()
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.idle

  const lastFetchStr = lastFetch
    ? lastFetch.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 20px', height: '100%',
    }}>
      {/* Status indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6,
        padding: '3px 10px', borderRadius: 20,
        background: cfg.color + '18',
        border: `1px solid ${cfg.color}40`,
      }}>
        {cfg.dot && (
          <div style={{
            width: 6, height: 6, borderRadius: '50%', background: cfg.color,
            animation: status === 'loading' ? 'pulse 1s infinite' : status === 'success' ? 'pulse 2.5s infinite' : 'none',
          }} />
        )}
        <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, letterSpacing: '.03em' }}>
          {cfg.label}
        </span>
      </div>

      {/* Last fetch time */}
      {lastFetchStr && (
        <span style={{ fontSize: 11, color: 'rgba(240,244,248,.4)' }}>
          {lastFetchStr}
        </span>
      )}

      {/* Refresh button — alleen als verbonden */}
      {isConnected && (
        <button
          onClick={refresh}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 6,
            background: 'transparent',
            border: '1px solid rgba(255,255,255,.1)',
            color: 'rgba(240,244,248,.5)',
            fontSize: 11, cursor: isLoading ? 'default' : 'pointer',
            opacity: isLoading ? .4 : 1, fontFamily: 'inherit',
            transition: '.15s',
          }}
          title="Data vernieuwen"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ transform: isLoading ? 'rotate(180deg)' : 'none', transition: '.5s' }}>
            <path d="M9 5A4 4 0 1 1 5 1"/>
            <polyline points="7,1 9,1 9,3"/>
          </svg>
          Vernieuwen
        </button>
      )}
    </div>
  )
}
