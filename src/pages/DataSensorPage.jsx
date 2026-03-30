import { useEffect, useMemo, useState } from 'react'
import { getSensors, searchSensorHistory } from '../api/sensorApi'

function metricColorClass(color) {
  if (color === 'blue') return 'metric-blue'
  if (color === 'yellow') return 'metric-yellow'
  if (color === 'cyan') return 'metric-cyan'
  return ''
}

function inferSensorVisual(sensorName) {
  const lower = String(sensorName || '').toLowerCase()

  if (lower.includes('temp')) return { icon: 'thermostat', color: 'blue' }
  if (lower.includes('humid')) return { icon: 'water_drop', color: 'cyan' }
  if (lower.includes('light')) return { icon: 'light_mode', color: 'yellow' }

  return { icon: 'sensors', color: 'blue' }
}

function formatSensorLogId(value) {
  const text = String(value || '').trim()
  if (!text) return '--'
  if (text.startsWith('#')) return text
  if (/^\d+$/.test(text)) return `#LOG-${text.padStart(4, '0')}`
  return `#${text}`
}

function DataSensorPage() {
  const [searchValue, setSearchValue] = useState('')
  const [activeSensor, setActiveSensor] = useState('')
  const [searchBy, setSearchBy] = useState('value')
  const [sortBy, setSortBy] = useState('Newest')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [sensors, setSensors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  })

  useEffect(() => {
    let active = true

    async function loadSensors() {
      try {
        const sensorList = await getSensors()
        if (!active) return
        setSensors(sensorList)
      } catch {
        if (!active) return
        setSensors([])
      }
    }

    loadSensors()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadSensorHistory() {
      setIsLoading(true)
      setErrorMessage('')

      const sortField = sortBy === 'ID Asc' || sortBy === 'ID Desc' ? 'id' : 'createdAt'
      const sortOrder = sortBy === 'Oldest' || sortBy === 'ID Asc' ? 'asc' : 'desc'

      try {
        const result = await searchSensorHistory({
          pageNo: page,
          pageSize: 10,
          sortBy: sortField,
          sortOrder,
          sensorName: activeSensor,
          searchBy,
          searchValue,
        })

        if (!active) return
        setRows(result.rows)
        setPagination(result.pagination)
      } catch (error) {
        if (!active) return
        setRows([])
        setPagination({
          pageNo: 1,
          pageSize: 10,
          total: 0,
          totalPages: 1,
        })
        setErrorMessage(error instanceof Error ? error.message : 'Cannot load sensor history')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadSensorHistory()

    return () => {
      active = false
    }
  }, [activeSensor, page, searchBy, searchValue, sortBy])

  const totalItems = pagination.total
  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pagination.pageSize
  const endIndex = Math.min(startIndex + pagination.pageSize, totalItems)

  const sensorTabs = useMemo(() => {
    const names = sensors.map((item) => item.name).filter(Boolean)
    return ['All', ...names]
  }, [sensors])

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
            placeholder="Search with selected field..."
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value)
              setPage(1)
            }}
          />

          <div className="sensor-search-by">
            <select
              value={searchBy}
              onChange={(event) => {
                setSearchBy(event.target.value)
                setPage(1)
              }}
            >
              <option value="value">Value</option>
              <option value="name">Name</option>
              <option value="time">Time</option>
              <option value="id">ID</option>
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>

        <div className="sensor-tabs">
          {sensorTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`sensor-tab ${(tab === 'All' ? activeSensor === '' : activeSensor === tab) ? 'active' : ''}`}
              onClick={() => {
                setActiveSensor(tab === 'All' ? '' : tab)
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
                        onChange={(event) => {
                          setSortBy(event.target.value)
                          setPage(1)
                        }}
                        aria-label="Sort rows"
                      >
                        <option>Newest</option>
                        <option>Oldest</option>
                        <option>ID Asc</option>
                        <option>ID Desc</option>
                      </select>
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const sensorName = row.Sensor?.name || 'Unknown Sensor'
                const visual = inferSensorVisual(sensorName)

                return (
                  <tr key={row.id}>
                    <td className="mono">{formatSensorLogId(row.id)}</td>
                    <td>
                      <div className="metric-cell">
                        <span className={`material-symbols-outlined ${metricColorClass(visual.color)}`}>
                          {visual.icon}
                        </span>
                        <span>{sensorName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={metricColorClass(visual.color)}>{row.value || '--'}</span>
                    </td>
                    <td>{row.createdAt || '--'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {isLoading ? <p className="action-feedback">Loading sensor history...</p> : null}
        {!isLoading && errorMessage ? <p className="action-feedback action-feedback-error">{errorMessage}</p> : null}
        {!isLoading && !errorMessage && rows.length === 0 ? <p className="action-feedback">No sensor data found.</p> : null}

        <div className="sensor-table-footer">
          <div className="sensor-footer-left">
            <p>
              Showing <strong>{totalItems === 0 ? 0 : startIndex + 1}</strong> to <strong>{endIndex}</strong> of{' '}
              <strong>{totalItems}</strong> entries
            </p>

            <div className="sensor-page-size">
              <label>Page Size:</label>
              <span>{pagination.pageSize}</span>
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
