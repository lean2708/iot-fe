function MetricCard({ icon, label, value, unit, delta, note, tone = 'blue' }) {
  const iconTone = {
    blue: { bg: 'rgba(19, 127, 236, 0.15)', color: '#137fec' },
    yellow: { bg: 'rgba(234, 179, 8, 0.18)', color: '#ca8a04' },
    violet: { bg: 'rgba(168, 85, 247, 0.2)', color: '#9333ea' },
  }

  const toneStyle = iconTone[tone] ?? iconTone.blue

  return (
    <article className="metric-card">
      <span className="metric-ghost material-symbols-outlined" aria-hidden="true">
        {icon}
      </span>

      <div className="metric-head">
        <div className="metric-icon" style={{ background: toneStyle.bg, color: toneStyle.color }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="metric-label">{label}</p>
      </div>

      <h3 className="metric-value">
        {value}
        <span className="metric-unit"> {unit}</span>
      </h3>

      <div className="metric-foot">
        {delta > 0 ? <span className="badge-up">+{delta}%</span> : <span className="badge-neutral">Today</span>}
        <p className="metric-note">{note}</p>
      </div>
    </article>
  )
}

export default MetricCard
