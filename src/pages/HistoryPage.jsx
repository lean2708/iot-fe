import { useMemo, useState } from 'react'

const ACTION_LOGS = [
  {
    id: '#ACT-9021',
    device: 'Main Light',
    type: 'Light',
    deviceIcon: 'light_mode',
    deviceColor: 'yellow',
    action: 'ON',
    timestamp: 'Oct 24, 2023 • 11:20:45 AM',
    status: 'ON',
    order: 9021,
  },
  {
    id: '#ACT-9020',
    device: 'Ceiling Fan',
    type: 'Fan',
    deviceIcon: 'air',
    deviceColor: 'blue',
    action: 'ON',
    timestamp: 'Oct 24, 2023 • 11:15:12 AM',
    status: 'ON',
    order: 9020,
  },
  {
    id: '#ACT-9019',
    device: 'Classroom TV',
    type: 'TV',
    deviceIcon: 'tv',
    deviceColor: 'purple',
    action: 'OFF',
    timestamp: 'Oct 24, 2023 • 11:10:05 AM',
    status: 'OFF',
    order: 9019,
  },
  {
    id: '#ACT-9018',
    device: 'Side Lamp',
    type: 'Light',
    deviceIcon: 'light_mode',
    deviceColor: 'yellow',
    action: 'ON',
    timestamp: 'Oct 24, 2023 • 11:05:30 AM',
    status: 'Loading',
    order: 9018,
  },
  {
    id: '#ACT-9017',
    device: 'Ceiling Fan',
    type: 'Fan',
    deviceIcon: 'air',
    deviceColor: 'blue',
    action: 'OFF',
    timestamp: 'Oct 24, 2023 • 10:55:15 AM',
    status: 'OFF',
    order: 9017,
  },
  {
    id: '#ACT-9016',
    device: 'Classroom TV',
    type: 'TV',
    deviceIcon: 'tv',
    deviceColor: 'purple',
    action: 'ON',
    timestamp: 'Oct 24, 2023 • 10:45:00 AM',
    status: 'ON',
    order: 9016,
  },
  {
    id: '#ACT-9015',
    device: 'Main Light',
    type: 'Light',
    deviceIcon: 'light_mode',
    deviceColor: 'yellow',
    action: 'OFF',
    timestamp: 'Oct 24, 2023 • 10:30:22 AM',
    status: 'OFF',
    order: 9015,
  },
  {
    id: '#ACT-9014',
    device: 'Ceiling Fan',
    type: 'Fan',
    deviceIcon: 'air',
    deviceColor: 'blue',
    action: 'ON',
    timestamp: 'Oct 24, 2023 • 10:20:16 AM',
    status: 'ON',
    order: 9014,
  },
  {
    id: '#ACT-9013',
    device: 'Classroom TV',
    type: 'TV',
    deviceIcon: 'tv',
    deviceColor: 'purple',
    action: 'OFF',
    timestamp: 'Oct 24, 2023 • 10:10:09 AM',
    status: 'OFF',
    order: 9013,
  },
  {
    id: '#ACT-9012',
    device: 'Side Lamp',
    type: 'Light',
    deviceIcon: 'light_mode',
    deviceColor: 'yellow',
    action: 'ON',
    timestamp: 'Oct 24, 2023 • 10:02:41 AM',
    status: 'ON',
    order: 9012,
  },
]

const DEVICE_TABS = ['All', 'Light', 'Fan', 'TV']

function iconColorClass(color) {
  if (color === 'yellow') return 'metric-yellow'
  if (color === 'blue') return 'metric-blue'
  if (color === 'purple') return 'history-icon-purple'
  return ''
}

function statusClass(status) {
  if (status === 'ON') return 'history-status-on'
  if (status === 'OFF') return 'history-status-off'
  return 'history-status-loading'
}

function HistoryPage() {
  const [search, setSearch] = useState('')
  const [searchBy, setSearchBy] = useState('device')
  const [activeTab, setActiveTab] = useState('All')
  const [sortBy, setSortBy] = useState('Newest')
  const pageSize = 10
  const [page, setPage] = useState(1)

  const filteredLogs = useMemo(() => {
    let logs = [...ACTION_LOGS]

    if (activeTab !== 'All') {
      logs = logs.filter((item) => item.type === activeTab)
    }

    if (search.trim()) {
      const keyword = search.trim().toLowerCase()
      logs = logs.filter((item) => {
        if (searchBy === 'device') return item.device.toLowerCase().includes(keyword)
        if (searchBy === 'action') return item.action.toLowerCase().includes(keyword)
        return item.id.toLowerCase().includes(keyword)
      })
    }

    if (sortBy === 'Newest') logs.sort((a, b) => b.order - a.order)
    if (sortBy === 'Oldest') logs.sort((a, b) => a.order - b.order)

    return logs
  }, [activeTab, search, searchBy, sortBy])

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
    <section className="sensor-history-page action-history-page">
      <h2 className="dashboard-title sensor-page-title">Action History</h2>

      <div className="sensor-toolbar">
        <div className="sensor-search-wrap">
          <span className="material-symbols-outlined sensor-search-icon">search</span>
          <input
            type="text"
            className="sensor-search-input"
            placeholder="Search devices or actions..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
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
              <option value="device">Device</option>
              <option value="action">Action</option>
              <option value="id">Log ID</option>
            </select>
            <span className="material-symbols-outlined">expand_more</span>
          </div>
        </div>

        <div className="sensor-tabs">
          {DEVICE_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`sensor-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab)
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
                      <span className={`material-symbols-outlined ${iconColorClass(row.deviceColor)}`}>
                        {row.deviceIcon}
                      </span>
                      <span>{row.device}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`history-action-text ${iconColorClass(row.deviceColor)}`}>
                      Turn {row.action}
                    </span>
                  </td>
                  <td>{row.timestamp}</td>
                  <td>
                    <div className={`history-status ${statusClass(row.status)}`}>
                      {row.status === 'Loading' ? (
                        <span className="material-symbols-outlined history-status-spin">progress_activity</span>
                      ) : (
                        <span className="history-status-dot" aria-hidden="true"></span>
                      )}
                      <span>{row.status}</span>
                    </div>
                  </td>
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

export default HistoryPage
