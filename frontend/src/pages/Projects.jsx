import { useState, useEffect, useCallback } from 'react'
import { profileAPI } from '../api/axios'
import MessageAlert from '../components/MessageAlert'

const RESOURCE = 'projects'
const EMPTY = { title: '', description: '', technologies: '', link: '' }

export default function Projects() {
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
  const openEdit = (entry) => { setForm({ title: entry.title||'', description: entry.description||'', technologies: entry.technologies||'', link: entry.link||'' }); setEditId(entry.id); setErrors({}); setShowForm(true) }
  const handleCancel = () => { setShowForm(false); setForm(EMPTY); setEditId(null); setErrors({}) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({})
    try {
      if (editId) { await profileAPI.update(RESOURCE, editId, form); setMsg({ text: 'Project updated!', type: 'success' }) }
      else { await profileAPI.create(RESOURCE, form); setMsg({ text: 'Project added!', type: 'success' }) }
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
      <div className="page-header"><h2><span className="header-icon">📁</span> Projects</h2>{!showForm && <button className="btn btn-primary" onClick={openAdd}>+ Add Project</button>}</div>
      <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />
      {showForm && (
        <div className="form-section">
          <h3>📝 {editId ? 'Edit' : 'Add'} Project</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Title *</label><input type="text" name="title" value={form.title} onChange={handleChange} placeholder="E-Commerce Platform" required />{errors.title && <div className="field-error">{errors.title}</div>}</div>
            <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe..." /></div>
            <div className="form-group"><label>Technologies</label><input type="text" name="technologies" value={form.technologies} onChange={handleChange} placeholder="React, Django (comma-separated)" /></div>
            <div className="form-group"><label>Link</label><input type="url" name="link" value={form.link} onChange={handleChange} placeholder="https://github.com/..." />{errors.link && <div className="field-error">{errors.link}</div>}</div>
            <div className="btn-group"><button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Saving...' : editId ? '💾 Update' : '💾 Save'}</button><button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button></div>
          </form>
        </div>
      )}
      {entries.length === 0 && !showForm ? (
        <div className="empty-state"><div className="empty-icon">📁</div><h3>No Projects Yet</h3><p>Showcase your work.</p><button className="btn btn-primary" onClick={openAdd}>+ Add Project</button></div>
      ) : (
        <div className="entry-list">
          {entries.map((e) => (
            <div key={e.id} className="entry-card">
              <div className="entry-info">
                <h4>{e.title}</h4>
                {e.description && <div className="entry-desc">{e.description}</div>}
                {e.technologies && <div className="entry-tags">{e.technologies.split(',').map((t, i) => <span key={i} className="tag">{t.trim()}</span>)}</div>}
                {e.link && <a href={e.link} target="_blank" rel="noopener noreferrer" className="entry-link">🔗 View</a>}
              </div>
              <div className="entry-actions"><button className="btn btn-warning" onClick={() => openEdit(e)}>✏️ Edit</button><button className="btn btn-danger" onClick={() => handleDelete(e.id)}>🗑️ Delete</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}