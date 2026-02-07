import { useState, useEffect, useCallback } from 'react'
import { profileAPI } from '../api/axios'
import MessageAlert from '../components/MessageAlert'

const EMPTY = { name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' }

export default function PersonalInfo() {
  const [form, setForm] = useState(EMPTY)
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [errors, setErrors] = useState({})

  const fetchData = useCallback(async () => {
    try {
      const res = await profileAPI.getPersonalInfo()
      if (res.data.data) { setForm(res.data.data); setExists(true) }
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setErrors({})
    try {
      if (exists) {
        await profileAPI.updatePersonalInfo(form)
        setMsg({ text: 'Personal info updated!', type: 'success' })
      } else {
        const res = await profileAPI.createPersonalInfo(form)
        setForm(res.data.data); setExists(true)
        setMsg({ text: 'Personal info saved!', type: 'success' })
      }
      window.dispatchEvent(new Event('refreshCounts'))
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object') {
        const fe = {}
        Object.keys(data).forEach((k) => { if (Array.isArray(data[k])) fe[k] = data[k].join(' ') })
        setErrors(fe)
      }
      setMsg({ text: err.response?.data?.message || 'Save failed.', type: 'error' })
    } finally { setSaving(false) }
  }

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h2><span className="header-icon">👤</span> Personal Information</h2>
      </div>
      <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />
      <div className="form-section">
        <h3>📋 {exists ? 'Update' : 'Add'} Your Details</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
              {errors.name && <div className="field-error">{errors.name}</div>}
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
              {errors.email && <div className="field-error">{errors.email}</div>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="+1-555-0100" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="San Francisco, CA" />
            </div>
          </div>
          <div className="form-group">
            <label>LinkedIn</label>
            <input type="url" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/johndoe" />
            {errors.linkedin && <div className="field-error">{errors.linkedin}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>GitHub</label>
              <input type="url" name="github" value={form.github} onChange={handleChange} placeholder="https://github.com/johndoe" />
              {errors.github && <div className="field-error">{errors.github}</div>}
            </div>
            <div className="form-group">
              <label>Website</label>
              <input type="url" name="website" value={form.website} onChange={handleChange} placeholder="https://johndoe.dev" />
              {errors.website && <div className="field-error">{errors.website}</div>}
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : exists ? '💾 Update Info' : '💾 Save Info'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}