import { useAppContext } from '../contexts/AppContext'

const PROFILE_INFO = [
  {
    label: 'Student ID',
    value: 'B22DCPT003',
    icon: 'badge',
    color: 'blue',
  },
  {
    label: 'Email Address',
    value: 'student.nguyen@university.edu.vn',
    icon: 'mail',
    color: 'purple',
  },
  {
    label: 'Class',
    value: 'D22CQCN01-B',
    icon: 'school',
    color: 'amber',
  },
  {
    label: 'Role',
    value: 'Administrator',
    icon: 'verified_user',
    color: 'emerald',
  },
]

const PROJECT_RESOURCES = [
  {
    title: 'PDF Report',
    description: 'Detailed project analysis and results.',
    icon: 'picture_as_pdf',
    iconTone: 'red',
  },
  {
    title: 'API Documentation',
    description: 'Spring Boot Swagger UI endpoints.',
    icon: 'api',
    iconTone: 'green',
  },
  {
    title: 'GitHub Repository',
    description: 'Source code and version control.',
    icon: 'code',
    iconTone: 'slate',
  },
  {
    title: 'Design Files',
    description: 'Figma UI and Draw.io system architecture.',
    icon: 'design_services',
    iconTone: 'purple',
  },
]

function infoColorClass(color) {
  return `profile-info-icon profile-info-icon-${color}`
}

function resourceToneClass(tone) {
  return `profile-resource-icon profile-resource-icon-${tone}`
}

function ProfilePage() {
  const { user } = useAppContext()

  return (
    <section className="profile-page">
      <header className="profile-heading-row">
        <h2 className="dashboard-title">Profile</h2>
      </header>

      <section className="profile-card">
        <div className="profile-hero">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" aria-hidden="true"></div>
            <span className="profile-online-dot" aria-hidden="true"></span>
          </div>

          <div className="profile-identity">
            <h1>{user.fullName || 'Nguyen Van A'}</h1>
            <p>IoT System Administrator</p>
          </div>

          <button type="button" className="profile-edit-btn">
            <span className="material-symbols-outlined">edit</span>
            Edit Profile
          </button>
        </div>

        <div className="profile-info-grid">
          {PROFILE_INFO.map((item) => (
            <article key={item.label} className="profile-info-card">
              <div className="profile-info-head">
                <div className={infoColorClass(item.color)}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <p>{item.label}</p>
              </div>

              <p className="profile-info-value" title={item.value}>
                {item.value}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="profile-resource-section">
        <div className="profile-section-head">
          <h3>Project Resources</h3>
          <div className="profile-section-divider"></div>
        </div>

        <div className="profile-resource-grid">
          {PROJECT_RESOURCES.map((item) => (
            <a key={item.title} className="profile-resource-card" href="#" onClick={(event) => event.preventDefault()}>
              <div className={resourceToneClass(item.iconTone)}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>

              <div className="profile-resource-content">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>

              <div className="profile-resource-arrow" aria-hidden="true">
                <span className="material-symbols-outlined">arrow_outward</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </section>
  )
}

export default ProfilePage
