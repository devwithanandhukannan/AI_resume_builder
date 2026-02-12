import { useState, useEffect, useCallback } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { profileAPI } from '../api/axios'
import {
  FiGrid, FiUser, FiBook, FiBriefcase,
  FiSettings, FiFolder, FiAward, FiStar,
  FiLink, FiLogOut, FiFileText, FiMail, FiHelpCircle
} from 'react-icons/fi'

export default function Sidebar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [counts, setCounts] = useState({})

  const fetchCounts = useCallback(async () => {
    try { const res = await profileAPI.dashboard(); setCounts(res.data.data) }
    catch {}
  }, [])

  useEffect(() => {
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [fetchCounts])

  useEffect(() => {
    const handler = () => fetchCounts()
    window.addEventListener('refreshCounts', handler)
    return () => window.removeEventListener('refreshCounts', handler)
  }, [fetchCounts])

  const handleLogout = async () => {
    try { await logoutUser(); navigate('/login') }
    catch {}
  }

  const dataItems = [
    { to: '/', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/personal-info', icon: <FiUser />, label: 'Personal Info', count: counts.has_personal_info ? '✓' : '—' },
    { to: '/education', icon: <FiBook />, label: 'Education', count: counts.education_count },
    { to: '/experience', icon: <FiBriefcase />, label: 'Experience', count: counts.experience_count },
    { to: '/skills', icon: <FiSettings />, label: 'Skills', count: counts.skills_count },
    { to: '/projects', icon: <FiFolder />, label: 'Projects', count: counts.projects_count },
    { to: '/certifications', icon: <FiAward />, label: 'Certifications', count: counts.certifications_count },
    { to: '/achievements', icon: <FiStar />, label: 'Achievements', count: counts.achievements_count },
    { to: '/additional-links', icon: <FiLink />, label: 'Additional Links', count: counts.additional_links_count },
  ]

  const aiItems = [
    { to: '/generate-resume', icon: <FiFileText />, label: 'Generate Resume', badge: 'AI' },
    { to: '/cold-email', icon: <FiMail />, label: 'Cold Email', badge: 'AI' },
    { to: '/interview-prep', icon: <FiHelpCircle />, label: 'Interview Prep', badge: 'AI' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>📋 Info Manager</h1>
        <div className="user-info">👤 {user?.first_name || user?.username}</div>
      </div>

      <nav className="sidebar-nav">
        {dataItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.count !== undefined && <span className="nav-count">{item.count}</span>}
          </NavLink>
        ))}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '12px 0', padding: '0 20px' }}>
          <span style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>AI Tools</span>
        </div>

        {aiItems.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            <span className="nav-count" style={{ background: 'rgba(102,126,234,0.3)', color: '#667eea' }}>{item.badge}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn"><FiLogOut /> Logout</button>
      </div>
    </aside>
  )
}