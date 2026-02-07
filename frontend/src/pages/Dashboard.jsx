import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { profileAPI } from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    profileAPI.dashboard()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>

  const sections = [
    { to: '/personal-info', icon: '👤', label: 'Personal Info', badge: data?.has_personal_info ? 'Completed' : 'Not Set', badgeClass: data?.has_personal_info ? 'completed' : 'pending' },
    { to: '/education', icon: '🎓', label: 'Education', value: data?.education_count },
    { to: '/experience', icon: '💼', label: 'Experience', value: data?.experience_count },
    { to: '/skills', icon: '⚙️', label: 'Skills', value: data?.skills_count },
    { to: '/projects', icon: '📁', label: 'Projects', value: data?.projects_count },
    { to: '/certifications', icon: '🏅', label: 'Certifications', value: data?.certifications_count },
    { to: '/achievements', icon: '🏆', label: 'Achievements', value: data?.achievements_count },
    { to: '/additional-links', icon: '🔗', label: 'Additional Links', value: data?.additional_links_count },
  ]

  return (
    <div>
      <div className="page-header">
        <h2><span className="header-icon">📊</span> Dashboard</h2>
      </div>
      <p style={{ color: '#666', marginBottom: 28, fontSize: 15 }}>
        Welcome, <strong>{user?.first_name || user?.username}</strong>!
      </p>
      <div className="dashboard-grid">
        {sections.map((s) => (
          <Link to={s.to} key={s.to} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            {s.badge ? (
              <span className={`stat-badge ${s.badgeClass}`}>{s.badge}</span>
            ) : (
              <div className="stat-value">{s.value}</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}