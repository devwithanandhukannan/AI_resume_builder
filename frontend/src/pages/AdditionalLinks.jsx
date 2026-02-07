import { useState, useEffect, useCallback } from 'react'
import { profileAPI } from '../api/axios'
import MessageAlert from '../components/MessageAlert'

const RESOURCE = 'additional-links'
const TYPES = ['Portfolio', 'Blog', 'Twitter', 'StackOverflow', 'Behance', 'Dribbble', 'Medium', 'YouTube', 'Other']
const EMPTY = { link_type: 'Portfolio', url: '' }

export default function AdditionalLinks() {
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
  const openEdit = (entry) => { setForm({ link_type: entry.link_type||'Portfolio', url: entry.url||'' }); setEditId(entry.id); setErrors({}); setShowForm(true) }
  const handleCancel = () => { setShowForm(false); setForm(EMPTY); setEditId(null); setErrors({}) }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setErrors({})
    try {
      if (editId) { await profileAPI.update(RESOURCE, editId, form); setMsg({ text: 'Updated!', type: 'success' }) }
      else { await profileAPI.create(RESOURCE, form); setMsg({ text: 'Added!', type: 'success' }) }
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
      <div className="page-header"><h2><span className="header-icon">🔗</span> Additional Links</h2>{!showForm && <button className="btn btn-primary" onClick={openAdd}>+ Add Link</button>}</div>
      <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />
      {showForm && (
        <div className="form-section">
          <h3>📝 {editId ? 'Edit' : 'Add'} Link</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group"><label>Type *</label><select name="link_type" value={form.link_type} onChange={handleChange}>{TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="form-group"><label>URL *</label><input type="url" name="url" value={form.url} onChange={handleChange} placeholder="https://..." required />{errors.url && <div className="field-error">{errors.url}</div>}</div>
            </div>
            <div className="btn-group"><button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Saving...' : editId ? '💾 Update' : '💾 Save'}</button><button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button></div>
          </form>
        </div>
      )}
      {entries.length === 0 && !showForm ? (
        <div className="empty-state"><div className="empty-icon">🔗</div><h3>No Links Yet</h3><p>Add portfolio, blog, social links.</p><button className="btn btn-primary" onClick={openAdd}>+ Add Link</button></div>
      ) : (
        <div className="entry-list">
          {entries.map((e) => (
            <div key={e.id} className="entry-card">
              <div className="entry-info"><h4>{e.link_type}</h4><a href={e.url} target="_blank" rel="noopener noreferrer" className="entry-link">🔗 {e.url}</a></div>
              <div className="entry-actions"><button className="btn btn-warning" onClick={() => openEdit(e)}>✏️ Edit</button><button className="btn btn-danger" onClick={() => handleDelete(e.id)}>🗑️ Delete</button></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}