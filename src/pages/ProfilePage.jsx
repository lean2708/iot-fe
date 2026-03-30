import { useEffect, useMemo, useState } from 'react'
import { getUserProfile, updateUserProfile } from '../api/userApi'
import { useAppContext } from '../contexts/AppContext'

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
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [formValues, setFormValues] = useState({
    fullName: '',
    studentCode: '',
    email: '',
    className: '',
    role: 'ADMIN',
  })

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const data = await getUserProfile('1')
        if (!active) return
        setProfile(data)
        setFormValues({
          fullName: data.fullName || '',
          studentCode: data.studentCode || '',
          email: data.email || '',
          className: data.className || '',
          role: data.role || 'ADMIN',
        })
      } catch (error) {
        if (!active) return
        setErrorMessage(error instanceof Error ? error.message : 'Cannot load profile')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [])

  const profileInfo = useMemo(
    () => [
      {
        label: 'Student ID',
        value: profile?.studentCode || 'N/A',
        icon: 'badge',
        color: 'blue',
      },
      {
        label: 'Email Address',
        value: profile?.email || 'N/A',
        icon: 'mail',
        color: 'purple',
      },
      {
        label: 'Class',
        value: profile?.className || 'N/A',
        icon: 'school',
        color: 'amber',
      },
      {
        label: 'Role',
        value: profile?.role || 'N/A',
        icon: 'verified_user',
        color: 'emerald',
      },
    ],
    [profile],
  )

  const displayName = profile?.fullName || user.fullName || 'Nguyen Van A'
  const avatarStyle = profile?.avatarUrl
    ? { backgroundImage: `url(${profile.avatarUrl})` }
    : undefined

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSaving(true)
    setSubmitMessage('')

    try {
      const updatedProfile = await updateUserProfile('1', {
        fullName: formValues.fullName.trim(),
        studentCode: formValues.studentCode.trim(),
        email: formValues.email.trim(),
        className: formValues.className.trim(),
        role: formValues.role,
      })

      setProfile(updatedProfile)
      setFormValues({
        fullName: updatedProfile.fullName || '',
        studentCode: updatedProfile.studentCode || '',
        email: updatedProfile.email || '',
        className: updatedProfile.className || '',
        role: updatedProfile.role || 'ADMIN',
      })
      setIsEditing(false)
      setSubmitMessage('Update user successfully.')
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : 'Cannot update profile')
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancelEdit() {
    setIsEditing(false)
    setSubmitMessage('')
    setFormValues({
      fullName: profile?.fullName || '',
      studentCode: profile?.studentCode || '',
      email: profile?.email || '',
      className: profile?.className || '',
      role: profile?.role || 'ADMIN',
    })
  }

  return (
    <section className="profile-page">
      <header className="profile-heading-row">
        <h2 className="dashboard-title">Profile</h2>
      </header>

      <section className="profile-card">
        {isLoading ? <p className="profile-feedback">Loading profile...</p> : null}
        {!isLoading && errorMessage ? <p className="profile-feedback profile-feedback-error">{errorMessage}</p> : null}
        {submitMessage ? <p className="profile-feedback profile-feedback-success">{submitMessage}</p> : null}

        <div className="profile-hero">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar" style={avatarStyle} aria-hidden="true"></div>
            <span className="profile-online-dot" aria-hidden="true"></span>
          </div>

          <div className="profile-identity">
            <h1>{displayName}</h1>
            <p>IoT System Administrator</p>
          </div>

          <button
            type="button"
            className="profile-edit-btn"
            onClick={() => {
              setIsEditing((previous) => !previous)
              setSubmitMessage('')
            }}
            disabled={isLoading || isSaving}
          >
            <span className="material-symbols-outlined">edit</span>
            {isEditing ? 'Close Form' : 'Edit Profile'}
          </button>
        </div>

        {isEditing ? (
          <form className="profile-edit-form" onSubmit={handleSubmit}>
            <div className="profile-form-grid">
              <label className="profile-form-field">
                <span>Full Name</span>
                <input
                  name="fullName"
                  value={formValues.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter full name"
                />
              </label>

              <label className="profile-form-field">
                <span>Student ID</span>
                <input
                  name="studentCode"
                  value={formValues.studentCode}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter student code"
                />
              </label>

              <label className="profile-form-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email"
                />
              </label>

              <label className="profile-form-field">
                <span>Class</span>
                <input
                  name="className"
                  value={formValues.className}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter class"
                />
              </label>

              <label className="profile-form-field">
                <span>Role</span>
                <select name="role" value={formValues.role} onChange={handleInputChange}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
              </label>
            </div>

            <div className="profile-form-actions">
              <button type="button" className="profile-form-cancel" onClick={handleCancelEdit} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className="profile-form-save" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : null}

        <div className="profile-info-grid">
          {profileInfo.map((item) => (
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
