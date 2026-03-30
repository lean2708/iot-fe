function DeviceCard({ device, onToggle }) {
  const isLoading = device.status === 'loading'
  const isOn = device.status === 'on'

  if (device.id === 'all-off') {
    return (
      <button type="button" className="device-card emergency">
        <div className="device-head">
          <div className="device-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' }}>
            <span className="material-symbols-outlined">power_settings_new</span>
          </div>
          <span className="badge-up" style={{ color: '#fff', background: '#dc2626' }}>
            Emergency
          </span>
        </div>

        <div>
          <p className="device-title" style={{ color: '#b91c1c' }}>
            Turn Off All
          </p>
          <p className="device-state">Force shutdown system</p>
        </div>
      </button>
    )
  }

  return (
    <article className={`device-card ${isLoading ? 'warn' : ''}`}>
      <div className="device-head">
        <div
          className="device-icon"
          style={{
            background: isOn ? 'rgba(250, 204, 21, 0.18)' : 'rgba(148, 163, 184, 0.2)',
            color: isOn ? '#ca8a04' : '#64748b',
          }}
        >
          <span className="material-symbols-outlined">{device.icon}</span>
        </div>

        {isLoading ? (
          <span className="device-status-dot" aria-hidden="true"></span>
        ) : (
          <label className="toggle" aria-label={`Toggle ${device.name}`}>
            <input
              type="checkbox"
              checked={isOn}
              onChange={(event) => onToggle(device.id, event.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        )}
      </div>

      <div>
        <p className="device-title">{device.name}</p>
        <p className="device-state">
          Status: {isLoading ? 'Loading...' : isOn ? 'ON' : 'OFF'}
        </p>
        {isLoading ? (
          <div className="device-progress" aria-hidden="true">
            <span></span>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default DeviceCard
