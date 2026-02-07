import { useState, useEffect, useCallback } from 'react'
import { profileAPI } from '../api/axios'
import MessageAlert from '../components/MessageAlert'

const RESOURCE = 'experience'
const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const EMPTY = { role: '', company: '', start_month: '', start_year: '', end_month: '', end_year: '', is_present: false, description: '' }

export default function Experience() {
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [errors, setErrors] = useState({})

  const fetchEntries = useCallback(async () => {
    try { const res = await profileAPI.list(RESOURCE); setEntries(res.data.data) }
    catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
    setErrors({ ...errors, [name]: '' })
  }

  const openAdd = () => { setForm(EMPTY); setEditId(null); setErrors({}); setShowForm(true) }
  const openEdit = (entry) => {
    setForm({ role: entry.role||'', company: entry.company||'', start_month: entry.start_month||'', start_year: entry.start_year||'', end_month: entry.end_month||'', end_year: entry.end_year||'', is_present: entry.is_present||false, description: entry.description||'' })
    setEditId(entry.id); setErrors({}); setShowForm(true)
  }
  const handleCancel = () => { setShowForm(false); setForm(EMPTY); setEditId(null); setErrors({}) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({})
    const payload = { ...form, start_year: form.start_year ? parseInt(form.start_year) : null, end_year: form.is_present ? null : (form.end_year ? parseInt(form.end_year) : null), end_month: form.is_present ? '' : form.end_month }
    try {
      if (editId) { await profileAPI.update(RESOURCE, editId, payload); setMsg({ text: 'Experience updated!', type: 'success' }) }
      else { await profileAPI.create(RESOURCE, payload); setMsg({ text: 'Experience added!', type: 'success' }) }
      setShowForm(false); setForm(EMPTY); setEditId(null); fetchEntries(); window.dispatchEvent(new Event('refreshCounts'))
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object') { const fe = {}; Object.keys(data).forEach((k) => { if (Array.isArray(data[k])) fe[k] = data[k].join(' ') }); setErrors(fe) }
      setMsg({ text: 'Save failed.', type: 'error' })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience?')) return
    try { await profileAPI.remove(RESOURCE, id); setMsg({ text: 'Deleted!', type: 'success' }); fetchEntries(); window.dispatchEvent(new Event('refreshCounts')) }
    catch { setMsg({ text: 'Delete failed.', type: 'error' }) }
  }

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h2><span className="header-icon">💼</span> Experience</h2>
        {!showForm && <button className="btn btn-primary" onClick={openAdd}>+ Add Experience</button>}
      </div>
      <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />

      {showForm && (
        <div className="form-section">
          <h3>📝 {editId ? 'Edit' : 'Add'} Experience</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Role *</label>
                <input type="text" name="role" value={form.role} onChange={handleChange} placeholder="Software Engineer" required />
                {errors.role && <div className="field-error">{errors.role}</div>}
              </div>
              <div className="form-group">
                <label>Company *</label>
                <input type="text" name="company" value={form.company} onChange={handleChange} placeholder="Google" required />
                {errors.company && <div className="field-error">{errors.company}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Month</label>
                <select name="start_month" value={form.start_month} onChange={handleChange}>
                  {MONTHS.map(m => <option key={m} value={m}>{m || 'Select'}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start Year *</label>
                <input type="number" name="start_year" value={form.start_year} onChange={handleChange} placeholder="2020" required min="1970" max="2040" />
                {errors.start_year && <div className="field-error">{errors.start_year}</div>}
              </div>
            </div>
            <div className="checkbox-group">
              <input type="checkbox" name="is_present" checked={form.is_present} onChange={handleChange} id="is_present" />
              <label htmlFor="is_present">I currently work here</label>
            </div>
            {!form.is_present && (
              <div className="form-row">
                <div className="form-group">
                  <label>End Month</label>
                  <select name="end_month" value={form.end_month} onChange={handleChange}>
                    {MONTHS.map(m => <option key={m} value={m}>{m || 'Select'}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>End Year</label>
                  <input type="number" name="end_year" value={form.end_year} onChange={handleChange} placeholder="2024" min="1970" max="2040" />
                  {errors.end_year && <div className="field-error">{errors.end_year}</div>}
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Responsibilities..." />
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Saving...' : editId ? '💾 Update' : '💾 Save'}</button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {entries.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="empty-icon">💼</div><h3>No Experience Yet</h3><p>Add your work experience.</p>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Experience</button>
        </div>
      ) : (
        <div className="entry-list">
          {entries.map((e) => (
            <div key={e.id} className="entry-card">
              <div className="entry-info">
                <h4>{e.role}</h4>
                <div className="entry-subtitle">{e.company}</div>
                <div className="entry-date">📅 {e.start_month} {e.start_year} — {e.is_present ? <span className="present-badge">Present</span> : `${e.end_month} ${e.end_year}`}</div>
                {e.description && <div className="entry-desc">{e.description}</div>}
              </div>
              <div className="entry-actions">
                <button className="btn btn-warning" onClick={() => openEdit(e)}>✏️ Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(e.id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}