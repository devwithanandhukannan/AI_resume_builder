import { useState, useEffect, useCallback } from 'react'
import { profileAPI } from '../api/axios'
import MessageAlert from '../components/MessageAlert'

const RESOURCE = 'skills'
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const EMPTY = { name: '', category: '', level: 'Intermediate' }

export default function Skills() {
  const [entries, setEntries] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [errors, setErrors] = useState({})

  const fetchEntries = useCallback(async () => {
    try { const res = await profileAPI.list(RESOURCE); setEntries(res.data.data) } catch {} finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchEntries() }, [fetchEntries])

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setErrors({ ...errors, [e.target.name]: '' }) }
  const openAdd = () => { setForm(EMPTY); setEditId(null); setErrors({}); setShowForm(true) }
  const openEdit = (entry) => { setForm({ name: entry.name||'', category: entry.category||'', level: entry.level||'Intermediate' }); setEditId(entry.id); setErrors({}); setShowForm(true) }
  const handleCancel = () => { setShowForm(false); setForm(EMPTY); setEditId(null); setErrors({}) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({})
    try {
      if (editId) { await profileAPI.update(RESOURCE, editId, form); setMsg({ text: 'Skill updated!', type: 'success' }) }
      else { await profileAPI.create(RESOURCE, form); setMsg({ text: 'Skill added!', type: 'success' }) }
      setShowForm(false); setForm(EMPTY); setEditId(null); fetchEntries(); window.dispatchEvent(new Event('refreshCounts'))
    } catch (err) {
      const data = err.response?.data; if (typeof data === 'object') { const fe = {}; Object.keys(data).forEach((k) => { if (Array.isArray(data[k])) fe[k] = data[k].join(' ') }); setErrors(fe) }
      setMsg({ text: 'Save failed.', type: 'error' })
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this skill?')) return
    try { await profileAPI.remove(RESOURCE, id); setMsg({ text: 'Deleted!', type: 'success' }); fetchEntries(); window.dispatchEvent(new Event('refreshCounts')) }
    catch { setMsg({ text: 'Delete failed.', type: 'error' }) }
  }

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h2><span className="header-icon">⚙️</span> Skills</h2>
        {!showForm && <button className="btn btn-primary" onClick={openAdd}>+ Add Skill</button>}
      </div>
      <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />
      {showForm && (
        <div className="form-section">
          <h3>📝 {editId ? 'Edit' : 'Add'} Skill</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row-3">
              <div className="form-group"><label>Skill Name *</label><input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Python" required />{errors.name && <div className="field-error">{errors.name}</div>}</div>
              <div className="form-group"><label>Category</label><input type="text" name="category" value={form.category} onChange={handleChange} placeholder="Language" /></div>
              <div className="form-group"><label>Level</label><select name="level" value={form.level} onChange={handleChange}>{LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Saving...' : editId ? '💾 Update' : '💾 Save'}</button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      {entries.length === 0 && !showForm ? (
        <div className="empty-state"><div className="empty-icon">⚙️</div><h3>No Skills Yet</h3><p>Add your skills.</p><button className="btn btn-primary" onClick={openAdd}>+ Add Skill</button></div>
      ) : (
        <div className="entry-list">
          {entries.map((e) => (
            <div key={e.id} className="entry-card">
              <div className="entry-info"><h4>{e.name}</h4>{e.category && <div className="entry-subtitle">{e.category}</div>}<span className={`level-badge ${e.level}`}>{e.level}</span></div>
              <div className="entry-actions"><button className="btn btn-warning" onClick={() => openEdit(e)}>✏️ Edit</button><button className="btn btn-danger" onClick={() => handleDelete(e.id)}>🗑️ Delete</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}