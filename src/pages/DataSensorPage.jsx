import { useMemo, useState } from 'react'

const SENSOR_LOGS = [
  {
    id: '#LOG-0512',
    metric: 'Temperature',
    metricIcon: 'thermostat',
    metricColor: 'blue',
    value: '24.5 °C',
    valueRaw: 24.5,
    timestamp: 'Oct 24, 2023 • 11:20:12 AM',
    timeIndex: 512,
  },
  {
    id: '#LOG-0511',
    metric: 'Humidity',
    metricIcon: 'water_drop',
    metricColor: 'cyan',
    value: '62%',
    valueRaw: 62,
    timestamp: 'Oct 24, 2023 • 11:19:05 AM',
    timeIndex: 511,
  },
  {
    id: '#LOG-0510',
    metric: 'Light Intensity',
    metricIcon: 'light_mode',
    metricColor: 'yellow',
    value: '520 Lux',
    valueRaw: 520,
    timestamp: 'Oct 24, 2023 • 11:18:50 AM',
    timeIndex: 510,
  },
  {
    id: '#LOG-0509',
    metric: 'Humidity',
    metricIcon: 'water_drop',
    metricColor: 'cyan',
    value: '58%',
    valueRaw: 58,
    timestamp: 'Oct 24, 2023 • 11:17:30 AM',
    timeIndex: 509,
  },
  {
    id: '#LOG-0508',
    metric: 'Temperature',
    metricIcon: 'thermostat',
    metricColor: 'blue',
    value: '24.2 °C',
    valueRaw: 24.2,
    timestamp: 'Oct 24, 2023 • 11:15:15 AM',
    timeIndex: 508,
  },
  {
    id: '#LOG-0507',
    metric: 'Light Intensity',
    metricIcon: 'light_mode',
    metricColor: 'yellow',
    value: '480 Lux',
    valueRaw: 480,
    timestamp: 'Oct 24, 2023 • 11:14:00 AM',
    timeIndex: 507,
  },
  {
    id: '#LOG-0506',
    metric: 'Temperature',
    metricIcon: 'thermostat',
    metricColor: 'blue',
    value: '25.1 °C',
    valueRaw: 25.1,
    timestamp: 'Oct 24, 2023 • 11:12:33 AM',
    timeIndex: 506,
  },
  {
    id: '#LOG-0505',
    metric: 'Humidity',
    metricIcon: 'water_drop',
    metricColor: 'cyan',
    value: '65%',
    valueRaw: 65,
    timestamp: 'Oct 24, 2023 • 11:10:41 AM',
    timeIndex: 505,
  },
  {
    id: '#LOG-0504',
    metric: 'Light Intensity',
    metricIcon: 'light_mode',
    metricColor: 'yellow',
    value: '505 Lux',
    valueRaw: 505,
    timestamp: 'Oct 24, 2023 • 11:08:07 AM',
    timeIndex: 504,
  },
  {
    id: '#LOG-0503',
    metric: 'Temperature',
    metricIcon: 'thermostat',
    metricColor: 'blue',
    value: '24.8 °C',
    valueRaw: 24.8,
    timestamp: 'Oct 24, 2023 • 11:05:28 AM',
    timeIndex: 503,
  },
]

const METRIC_TABS = ['All', 'Temperature', 'Light Intensity', 'Humidity']

function metricColorClass(color) {
  if (color === 'blue') return 'metric-blue'
  if (color === 'yellow') return 'metric-yellow'
  if (color === 'cyan') return 'metric-cyan'
  return ''
}

function DataSensorPage() {
  const [search, setSearch] = useState('')
  const [filterBy, setFilterBy] = useState('All')
  const [searchBy, setSearchBy] = useState('value')
  const [sortBy, setSortBy] = useState('Newest')
  const pageSize = 10
  const [page, setPage] = useState(1)

  const filteredLogs = useMemo(() => {
    let logs = [...SENSOR_LOGS]

    if (filterBy !== 'All') {
      logs = logs.filter((item) => item.metric === filterBy)
    }

    if (search.trim()) {
      const keyword = search.trim().toLowerCase()
      logs = logs.filter((item) => {
        if (searchBy === 'value') return item.value.toLowerCase().includes(keyword)
        if (searchBy === 'id') return item.id.toLowerCase().includes(keyword)
        return item.timestamp.toLowerCase().includes(keyword)
      })
    }

    if (sortBy === 'Oldest') logs.sort((a, b) => a.timeIndex - b.timeIndex)
    if (sortBy === 'Newest') logs.sort((a, b) => b.timeIndex - a.timeIndex)
    if (sortBy === 'High Value') logs.sort((a, b) => b.valueRaw - a.valueRaw)
    if (sortBy === 'Low Value') logs.sort((a, b) => a.valueRaw - b.valueRaw)

    return logs
  }, [filterBy, search, searchBy, sortBy])

  const totalItems = filteredLogs.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const pageRows = filteredLogs.slice(startIndex, endIndex)

  function changePage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
  }

  const previewPages = useMemo(() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    if (currentPage <= 2) return [1, 2, 3]
    if (currentPage >= totalPages - 1) return [totalPages - 2, totalPages - 1, totalPages]
    return [currentPage - 1, currentPage, currentPage + 1]
  }, [currentPage, totalPages])

  return (
    <section className="sensor-history-page">
      <h2 className="dashboard-title sensor-page-title">Data Sensor</h2>

      <div className="sensor-toolbar">
        <div className="sensor-search-wrap">
          <span className="material-symbols-outlined sensor-search-icon">search</span>
          <input
            type="text"
            className="sensor-search-input"
            placeholder="Search logs..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />

          <div className="sensor-search-by">
            <select
              value={searchBy}
              onChange={(event) => setSearchBy(event.target.value)}
            >
              <option value="value">Value</option>
              <option value="time">Time</option>
              <option value="id">Log ID</option>
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>

        <div className="sensor-tabs">
          {METRIC_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`sensor-tab ${filterBy === tab ? 'active' : ''}`}
              onClick={() => {
                setFilterBy(tab)
                setPage(1)
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <section className="sensor-table-card">
        <div className="sensor-table-scroller">
          <table className="sensor-history-table">
            <colgroup>
              <col className="sensor-col-id" />
              <col className="sensor-col-name" />
              <col className="sensor-col-value" />
              <col className="sensor-col-time" />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>Sensor Name</th>
                <th>Value</th>
                <th>
                  <div className="table-head-sort">
                    <span>Timestamp</span>
                    <div className="sensor-sort-wrap">
                      <span className="material-symbols-outlined">sort</span>
                      <span>Sort</span>
                      <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        aria-label="Sort rows"
                      >
                        <option>Newest</option>
                        <option>Oldest</option>
                        <option>High Value</option>
                        <option>Low Value</option>
                      </select>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.id}>
                  <td className="mono">{row.id}</td>
                  <td>
                    <div className="metric-cell">
                      <span className={`material-symbols-outlined ${metricColorClass(row.metricColor)}`}>
                        {row.metricIcon}
                      </span>
                      <span>{row.metric}</span>
                    </div>
                  </td>
                  <td>
                    <span className={metricColorClass(row.metricColor)}>{row.value}</span>
                  </td>
                  <td>{row.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sensor-table-footer">
          <div className="sensor-footer-left">
            <p>
              Showing <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong> to <strong>{endIndex}</strong> of{' '}
              <strong>{totalItems}</strong> entries
            </p>

            <div className="sensor-page-size">
              <label>Page Size:</label>
              <span>{pageSize}</span>
            </div>
          </div>

          <div className="sensor-pagination">
            <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>
              Previous
            </button>
            {previewPages.map((item) => (
              <button
                key={item}
                type="button"
                className={item === currentPage ? 'active' : ''}
                onClick={() => changePage(item)}
              >
                {item}
              </button>
            ))}
            {totalPages > 4 ? <span>...</span> : null}
            {totalPages > 4 ? (
              <button type="button" onClick={() => changePage(totalPages)}>
                {totalPages}
              </button>
            ) : null}
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => changePage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </section>
  )
}

export default DataSensorPage
