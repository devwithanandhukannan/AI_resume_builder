import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../api/axios'
import MessageAlert from '../components/MessageAlert'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.forgotPassword({ email })
      setMsg({ text: res.data.message, type: 'success' })
    } catch {
      setMsg({ text: 'Something went wrong.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon">🔑</div>
        <h2>Forgot Password</h2>
        <p className="subtitle">Enter your email to receive a reset link</p>
        <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Sending...' : '📧 Send Reset Link'}
          </button>
        </form>
        <div className="auth-links">
          <p><Link to="/login">← Back to Login</Link></p>
        </div>
      </div>
    </div>
  )
}