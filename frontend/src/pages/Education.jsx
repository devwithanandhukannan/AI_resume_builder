import { useState, useEffect, useCallback } from 'react'
import { profileAPI } from '../api/axios'
import MessageAlert from '../components/MessageAlert'

const RESOURCE = 'education'
const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const EMPTY = { degree: '', institution: '', start_month: '', start_year: '', end_month: '', end_year: '', gpa: '', description: '' }

export default function Education() {
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
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const openAdd = () => { setForm(EMPTY); setEditId(null); setErrors({}); setShowForm(true) }

  const openEdit = (entry) => {
    setForm({
      degree: entry.degree || '', institution: entry.institution || '',
      start_month: entry.start_month || '', start_year: entry.start_year || '',
      end_month: entry.end_month || '', end_year: entry.end_year || '',
      gpa: entry.gpa || '', description: entry.description || '',
    })
    setEditId(entry.id); setErrors({}); setShowForm(true)
  }

  const handleCancel = () => { setShowForm(false); setForm(EMPTY); setEditId(null); setErrors({}) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({})
    const payload = { ...form, start_year: form.start_year ? parseInt(form.start_year) : null, end_year: form.end_year ? parseInt(form.end_year) : null }
    try {
      if (editId) { await profileAPI.update(RESOURCE, editId, payload); setMsg({ text: 'Education updated!', type: 'success' }) }
      else { await profileAPI.create(RESOURCE, payload); setMsg({ text: 'Education added!', type: 'success' }) }
      setShowForm(false); setForm(EMPTY); setEditId(null); fetchEntries()
      window.dispatchEvent(new Event('refreshCounts'))
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object') { const fe = {}; Object.keys(data).forEach((k) => { if (Array.isArray(data[k])) fe[k] = data[k].join(' ') }); setErrors(fe) }
      setMsg({ text: 'Save failed.', type: 'error' })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this education entry?')) return
    try { await profileAPI.remove(RESOURCE, id); setMsg({ text: 'Deleted!', type: 'success' }); fetchEntries(); window.dispatchEvent(new Event('refreshCounts')) }
    catch { setMsg({ text: 'Delete failed.', type: 'error' }) }
  }

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h2><span className="header-icon">🎓</span> Education</h2>
        {!showForm && <button className="btn btn-primary" onClick={openAdd}>+ Add Education</button>}
      </div>
      <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />

      {showForm && (
        <div className="form-section">
          <h3>📝 {editId ? 'Edit' : 'Add'} Education</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Degree *</label>
                <input type="text" name="degree" value={form.degree} onChange={handleChange} placeholder="B.S. Computer Science" required />
                {errors.degree && <div className="field-error">{errors.degree}</div>}
              </div>
              <div className="form-group">
                <label>Institution *</label>
                <input type="text" name="institution" value={form.institution} onChange={handleChange} placeholder="Stanford University" required />
                {errors.institution && <div className="field-error">{errors.institution}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Month</label>
                <select name="start_month" value={form.start_month} onChange={handleChange}>
                  {MONTHS.map(m => <option key={m} value={m}>{m || 'Select Month'}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start Year *</label>
                <input type="number" name="start_year" value={form.start_year} onChange={handleChange} placeholder="2018" required min="1970" max="2040" />
                {errors.start_year && <div className="field-error">{errors.start_year}</div>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>End Month</label>
                <select name="end_month" value={form.end_month} onChange={handleChange}>
                  {MONTHS.map(m => <option key={m} value={m}>{m || 'Select Month'}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>End Year</label>
                <input type="number" name="end_year" value={form.end_year} onChange={handleChange} placeholder="2022" min="1970" max="2040" />
              </div>
            </div>
            <div className="form-group">
              <label>GPA</label>
              <input type="text" name="gpa" value={form.gpa} onChange={handleChange} placeholder="3.85/4.0" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Coursework, honors..." />
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
          <div className="empty-icon">🎓</div>
          <h3>No Education Entries Yet</h3>
          <p>Add your educational background.</p>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Education</button>
        </div>
      ) : (
        <div className="entry-list">
          {entries.map((entry) => (
            <div key={entry.id} className="entry-card">
              <div className="entry-info">
                <h4>{entry.degree}</h4>
                <div className="entry-subtitle">{entry.institution}</div>
                <div className="entry-date">📅 {entry.start_month} {entry.start_year} — {entry.end_year ? `${entry.end_month} ${entry.end_year}` : 'Present'}</div>
                {entry.gpa && <div className="entry-desc"><strong>GPA:</strong> {entry.gpa}</div>}
                {entry.description && <div className="entry-desc">{entry.description}</div>}
              </div>
              <div className="entry-actions">
                <button className="btn btn-warning" onClick={() => openEdit(entry)}>✏️ Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(entry.id)}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}