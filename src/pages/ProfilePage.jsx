import { useAppContext } from '../contexts/AppContext'

function ProfilePage() {
  const { user, darkMode, setDarkMode } = useAppContext()

  return (
    <section className="simple-page">
      <h2>Profile</h2>
      <p>
        Tài khoản hiện tại: <strong>{user.fullName}</strong> - {user.status}
      </p>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="theme-mode" style={{ color: 'var(--text-muted)' }}>
          Chế độ giao diện
        </label>
        <select
          id="theme-mode"
          style={{ marginLeft: 10, padding: '6px 10px' }}
          value={darkMode ? 'dark' : 'light'}
          onChange={(event) => setDarkMode(event.target.value === 'dark')}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
    </section>
  )
}

export default ProfilePage
