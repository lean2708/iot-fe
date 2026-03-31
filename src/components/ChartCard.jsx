function buildPath(values, maxY) {
  if (!values?.length) return ''

  const width = 400
  const height = 150
  const step = width / (values.length - 1)

  const points = values.map((value, index) => {
    const x = index * step
    const y = height - (value / maxY) * (height - 20)
    return `${x},${y}`
  })

  return points.join(' ')
}

function ChartCard({ title, subtitle, pill, pillStyle, data, axis, stroke, gradientId, unit }) {
  const maxY = Math.max(...data) * 1.1
  const polyline = buildPath(data, maxY)
  const currentValue = data && data.length > 0 ? data[data.length - 1] : null

  return (
    <article className="chart-card">
      <div className="chart-top">
        <div>
          <h3 className="chart-title">{title}</h3>
          <p className="chart-sub">{subtitle}</p>
        </div>
        <span className="chart-pill" style={pillStyle}>
          {pill}
        </span>
      </div>


      <div className="chart-graph" style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
        {/* Y-axis */}
        <div style={{ width: 40, height: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', marginRight: 4 }}>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
            const value = Math.round(maxY * (1 - t));
            return (
              <span
                key={i}
                style={{ fontSize: 10, color: '#888', lineHeight: 1, whiteSpace: 'nowrap', minWidth: 0 }}
              >
                {value}{unit ? ' ' + unit : ''}
              </span>
            );
          })}
        </div>
        {/* Chart SVG */}
        <svg viewBox="0 0 400 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.24"></stop>
              <stop offset="100%" stopColor={stroke} stopOpacity="0"></stop>
            </linearGradient>
          </defs>

          <polyline
            points={`${polyline} 400,150 0,150`}
            fill={`url(#${gradientId})`}
            stroke="none"
          ></polyline>
          <polyline
            points={polyline}
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></polyline>
        </svg>
      </div>

      <div className="chart-axis" style={{ marginTop: 16 }}>
        {axis.map((item, index) => (
          <span key={index}>{item}</span>
        ))}
        {/* Removed Avg label as requested */}
      </div>
    </article>
  )
}

export default ChartCard
