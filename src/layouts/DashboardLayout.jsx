import Sidebar from '../components/Sidebar'

function DashboardLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="content-panel">
        <div className="mobile-header">
          <div className="mobile-title">
            <span className="material-symbols-outlined">school</span>
            SmartClass
          </div>
          <span className="material-symbols-outlined">menu</span>
        </div>

        <main className="page-wrap">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
