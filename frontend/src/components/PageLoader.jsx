import React from 'react'

export default function PageLoader({ label = 'Loading Pigify...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        width: '100%',
        padding: '32px 16px',
        color: 'var(--text-main, #f8fafc)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          border: '3px solid rgba(244, 63, 94, 0.2)',
          borderTopColor: '#f43f5e',
          borderRightColor: '#10b981',
          animation: 'pigify-spin 0.75s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          willChange: 'transform',
        }}
      />
      <span
        style={{
          marginTop: '14px',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          color: 'var(--text-muted, #94a3b8)',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {label}
      </span>
      <style>{`
        @keyframes pigify-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
