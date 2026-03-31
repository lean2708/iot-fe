function TopBar({ title, children }) {
  return (
    <header className="dashboard-header">
      <h2 className="dashboard-title">{title}</h2>
      {children && <div className="topbar-actions">{children}</div>}
    </header>
  )
}

export default TopBar
