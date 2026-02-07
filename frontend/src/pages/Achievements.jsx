import { useState, useEffect, useCallback } from 'react'
import { profileAPI } from '../api/axios'
import MessageAlert from '../components/MessageAlert'

const RESOURCE = 'achievements'
const EMPTY = { title: '', year: '', description: '' }

export default function Achievements() {
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [errors, setErrors] = useState({})

  const fetchEntries = useCallback(async () => { try { const r = await profileAPI.list(RESOURCE); setEntries(r.data.data) } catch {} finally { setLoading(false) } }, [])
  useEffect(() => { fetchEntries() }, [fetchEntries])

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: '' }) }
  const openAdd = () => { setForm(EMPTY); setEditId(null); setErrors({}); setShowForm(true) }
  const openEdit = (entry) => { setForm({ title: entry.title||'', year: entry.year||'', description: entry.description||'' }); setEditId(entry.id); setErrors({}); setShowForm(true) }
  const handleCancel = () => { setShowForm(false); setForm(EMPTY); setEditId(null); setErrors({}) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({})
    const payload = { ...form, year: form.year ? parseInt(form.year) : null }
    try {
      if (editId) { await profileAPI.update(RESOURCE, editId, payload); setMsg({ text: 'Updated!', type: 'success' }) }
      else { await profileAPI.create(RESOURCE, payload); setMsg({ text: 'Added!', type: 'success' }) }
      setShowForm(false); setForm(EMPTY); setEditId(null); fetchEntries(); window.dispatchEvent(new Event('refreshCounts'))
    } catch (err) {
      const data = err.response?.data; if (typeof data === 'object') { const fe = {}; Object.keys(data).forEach((k) => { if (Array.isArray(data[k])) fe[k] = data[k].join(' ') }); setErrors(fe) }
      setMsg({ text: 'Save failed.', type: 'error' })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return
    try { await profileAPI.remove(RESOURCE, id); setMsg({ text: 'Deleted!', type: 'success' }); fetchEntries(); window.dispatchEvent(new Event('refreshCounts')) }
    catch { setMsg({ text: 'Failed.', type: 'error' }) }
  }

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>

  return (
    <div>
      <div className="page-header"><h2><span className="header-icon">🏆</span> Achievements</h2>{!showForm && <button className="btn btn-primary" onClick={openAdd}>+ Add Achievement</button>}</div>
      <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />
      {showForm && (
        <div className="form-section">
          <h3>📝 {editId ? 'Edit' : 'Add'} Achievement</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Title *</label><input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Hackathon Winner" required />{errors.title && <div className="field-error">{errors.title}</div>}</div>
              <div className="form-group"><label>Year *</label><input type="number" name="year" value={form.year} onChange={handleChange} placeholder="2023" required min="1970" max="2040" />{errors.year && <div className="field-error">{errors.year}</div>}</div>
            </div>
            <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe..." /></div>
            <div className="btn-group"><button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Saving...' : editId ? '💾 Update' : '💾 Save'}</button><button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button></div>
          </form>
        </div>
      )}
      {entries.length === 0 && !showForm ? (
        <div className="empty-state"><div className="empty-icon">🏆</div><h3>No Achievements Yet</h3><p>Add awards and accomplishments.</p><button className="btn btn-primary" onClick={openAdd}>+ Add</button></div>
      ) : (
        <div className="entry-list">
          {entries.map((e) => (
            <div key={e.id} className="entry-card">
              <div className="entry-info"><h4>{e.title}</h4><div className="entry-date">📅 {e.year}</div>{e.description && <div className="entry-desc">{e.description}</div>}</div>
              <div className="entry-actions"><button className="btn btn-warning" onClick={() => openEdit(e)}>✏️ Edit</button><button className="btn btn-danger" onClick={() => handleDelete(e.id)}>🗑️ Delete</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}