import { useAppContext } from '../contexts/AppContext'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'data-sensor', label: 'Data Sensor', icon: 'sensors' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'profile', label: 'Profile', icon: 'person' },
]

function Sidebar() {
  const { currentPage, setCurrentPage, user } = useAppContext()

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <div className="brand-mark">
            <span className="material-symbols-outlined">school</span>
          </div>
          <div>
            <h1 className="brand-title">SmartClass</h1>
            <p className="brand-sub">IoT Management</p>
          </div>
        </div>
      </div>

      <nav className="nav-list" aria-label="Sidebar Navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar" aria-hidden="true"></div>
        <div>
          <p className="sidebar-user-name">{user.fullName}</p>
          <p className="sidebar-user-state">{user.status}</p>
        </div>
        <button type="button" className="sidebar-logout" aria-label="Logout">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
