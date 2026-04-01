function DeviceCard({ device, onToggle }) {
  const isLoading = device.status === 'loading'
  const isOn = device.status === 'on'
  const activeTone = {
    light: { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', toggle: '#f59e0b' },
    fan: { bg: 'rgba(59, 130, 246, 0.18)', color: '#3b82f6', toggle: '#3b82f6' },
    tv: { bg: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', toggle: '#a855f7' },
  }

  const onStyle = activeTone[device.id] ?? activeTone.light

  return (
    <article className={`device-card ${isLoading ? 'device-card--loading' : ''}`}>
      {/* Loading overlay — covers the card while waiting for backend */}
      {isLoading && (
        <div className="device-loading-overlay" aria-label="Đang xử lý…">
          <div className="device-spinner" />
        </div>
      )}

      <div className="device-head">
        <div
          className="device-icon"
          style={{
            background: isOn ? onStyle.bg : 'rgba(148, 163, 184, 0.2)',
            color: isOn ? onStyle.color : '#64748b',
            opacity: isLoading ? 0.4 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <span className="material-symbols-outlined">{device.icon}</span>
        </div>

        <label
          className="toggle"
          aria-label={`Toggle ${device.name}`}
          style={{ opacity: isLoading ? 0.35 : 1, pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.2s' }}
        >
          <input
            type="checkbox"
            checked={isOn}
            disabled={isLoading}
            onChange={(event) => onToggle(device.id, event.target.checked)}
          />
          <span className="toggle-slider" style={{ background: isOn ? onStyle.toggle : '#cbd5e1' }}></span>
        </label>
      </div>

      <div style={{ opacity: isLoading ? 0.45 : 1, transition: 'opacity 0.2s' }}>
        <p className="device-title">{device.name}</p>
        <p className="device-state" style={{ color: isOn ? onStyle.color : undefined }}>
          Status: {isLoading ? 'Loading…' : isOn ? 'ON' : 'OFF'}
        </p>
      </div>
    </article>
  )
}

export default DeviceCard

