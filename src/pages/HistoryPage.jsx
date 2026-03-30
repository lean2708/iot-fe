import { useEffect, useMemo, useState } from 'react'
import { getDevices, searchActionHistory } from '../api/actionApi'

function iconColorClass(color) {
  if (color === 'yellow') return 'metric-yellow'
  if (color === 'blue') return 'metric-blue'
  if (color === 'purple') return 'history-icon-purple'
  return ''
}

function inferDeviceVisual(deviceName) {
  const lower = String(deviceName || '').toLowerCase()

  if (lower.includes('light') || lower.includes('lamp')) {
    return { icon: 'light_mode', color: 'yellow' }
  }
  if (lower.includes('fan')) {
    return { icon: 'air', color: 'blue' }
  }
  if (lower.includes('tv')) {
    return { icon: 'tv', color: 'purple' }
  }
  return { icon: 'sensors', color: 'cyan' }
}

function formatActionId(value) {
  const text = String(value || '').trim()
  if (!text) return '--'
  if (text.startsWith('#')) return text
  if (/^\d+$/.test(text)) return `#ACT-${text.padStart(4, '0')}`
  return `#${text}`
}

function statusClass(status) {
  const normalized = String(status || '').toUpperCase()
  if (normalized === 'ON') return 'history-status-on'
  if (normalized === 'OFF') return 'history-status-off'
  return 'history-status-loading'
}

function HistoryPage() {
  const [searchValue, setSearchValue] = useState('')
  const [searchBy, setSearchBy] = useState('action')
  const [activeDevice, setActiveDevice] = useState('')
  const [sortBy, setSortBy] = useState('Newest')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState([])
  const [devices, setDevices] = useState([])
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

    async function loadDevices() {
      try {
        const deviceList = await getDevices()
        if (!active) return
        setDevices(deviceList)
      } catch {
        if (!active) return
        setDevices([])
      }
    }

    loadDevices()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    async function loadActions() {
      setIsLoading(true)
      setErrorMessage('')

      const sortField = sortBy === 'ID Asc' || sortBy === 'ID Desc' ? 'id' : 'createdAt'
      const sortOrder = sortBy === 'Oldest' || sortBy === 'ID Asc' ? 'asc' : 'desc'

      try {
        const result = await searchActionHistory({
          pageNo: page,
          pageSize: 10,
          sortBy: sortField,
          sortOrder,
          deviceName: activeDevice,
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
        setErrorMessage(error instanceof Error ? error.message : 'Cannot load action history')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadActions()

    return () => {
      active = false
    }
  }, [activeDevice, page, searchBy, searchValue, sortBy])

  const totalItems = pagination.total
  const totalPages = Math.max(1, pagination.totalPages)
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * pagination.pageSize
  const endIndex = Math.min(startIndex + pagination.pageSize, totalItems)

  const deviceTabs = useMemo(() => {
    const names = devices.map((item) => item.name).filter(Boolean)
    return ['All', ...names]
  }, [devices])

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
    <section className="sensor-history-page action-history-page">
      <h2 className="dashboard-title sensor-page-title">Action History</h2>

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
              <option value="id">ID</option>
              <option value="action">Action</option>
              <option value="status">Status</option>
              <option value="device">Device</option>
              <option value="name">Name</option>
              <option value="time">Time</option>
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>

        <div className="sensor-tabs">
          {deviceTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`sensor-tab ${(tab === 'All' ? activeDevice === '' : activeDevice === tab) ? 'active' : ''}`}
              onClick={() => {
                setActiveDevice(tab === 'All' ? '' : tab)
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
          <table className="sensor-history-table action-history-table">
            <colgroup>
              <col className="action-col-id" />
              <col className="action-col-device" />
              <col className="action-col-action" />
              <col className="action-col-time" />
              <col className="action-col-status" />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>Device</th>
                <th>Action</th>
                <th>Timestamp</th>
                <th>
                  <div className="table-head-sort">
                    <span>Status</span>
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
                const deviceName = row.Device?.name || 'Unknown Device'
                const visual = inferDeviceVisual(deviceName)
                const action = String(row.action || '').toUpperCase() || '--'
                const status = String(row.status || '').toUpperCase() || '--'

                return (
                <tr key={row.id}>
                  <td className="mono">{formatActionId(row.id)}</td>
                  <td>
                    <div className="metric-cell">
                      <span className={`material-symbols-outlined ${iconColorClass(visual.color)}`}>
                        {visual.icon}
                      </span>
                      <span>{deviceName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`history-action-text ${iconColorClass(visual.color)}`}>
                      Turn {action}
                    </span>
                  </td>
                  <td>{row.createdAt || '--'}</td>
                  <td>
                    <div className={`history-status ${statusClass(status)}`}>
                      {status === 'LOADING' ? (
                        <span className="material-symbols-outlined history-status-spin">progress_activity</span>
                      ) : (
                        <span className="history-status-dot" aria-hidden="true"></span>
                      )}
                      <span>{status === 'LOADING' ? 'Loading' : status}</span>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {isLoading ? <p className="action-feedback">Loading action history...</p> : null}
        {!isLoading && errorMessage ? <p className="action-feedback action-feedback-error">{errorMessage}</p> : null}
        {!isLoading && !errorMessage && rows.length === 0 ? <p className="action-feedback">No actions found.</p> : null}

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

export default HistoryPage
