import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MessageAlert from '../components/MessageAlert'

export default function Signup() {
  const { signupUser } = useAuth()
  const [form, setForm] = useState({
    username: '', email: '', first_name: '',
    last_name: '', password: '', password_confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })
    setErrors({})
    try {
      await signupUser(form)
    } catch (err) {
      const data = err.response?.data
      if (typeof data === 'object') {
        const fe = {}
        Object.keys(data).forEach((k) => {
          if (Array.isArray(data[k])) fe[k] = data[k].join(' ')
        })
        setErrors(fe)
      }
      setMsg({ text: 'Please fix the errors below.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon">📝</div>
        <h2>Create Account</h2>
        <p className="subtitle">Start managing your information</p>
        <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="first_name" value={form.first_name} onChange={handleChange} placeholder="John" required />
              {errors.first_name && <div className="field-error">{errors.first_name}</div>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Doe" required />
              {errors.last_name && <div className="field-error">{errors.last_name}</div>}
            </div>
          </div>
          <div className="form-group">
            <label>Username</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="johndoe" required />
            {errors.username && <div className="field-error">{errors.username}</div>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 8 chars" required />
              {errors.password && <div className="field-error">{errors.password}</div>}
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="password_confirm" value={form.password_confirm} onChange={handleChange} placeholder="Re-enter" required />
              {errors.password_confirm && <div className="field-error">{errors.password_confirm}</div>}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating...' : '🚀 Sign Up'}
          </button>
        </form>
        <div className="auth-links">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  )
}