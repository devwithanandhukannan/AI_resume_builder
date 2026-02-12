import { useState } from 'react'
import { emailAPI } from '../api/axios'
import MessageAlert from '../components/MessageAlert'

const TONES = [
  { value: 'professional', label: '👔 Professional' },
  { value: 'friendly', label: '😊 Friendly' },
  { value: 'confident', label: '💪 Confident' },
  { value: 'enthusiastic', label: '🔥 Enthusiastic' },
]

const TYPES = [
  { value: 'application', label: '📩 Job Application', desc: 'Direct application to a job posting' },
  { value: 'networking', label: '🤝 Networking', desc: 'Request informational interview' },
  { value: 'referral', label: '🔗 Referral Request', desc: 'Ask someone for a referral' },
  { value: 'followup', label: '📬 Follow-up', desc: 'Follow up after application/interview' },
]

export default function ColdEmail() {
  const [form, setForm] = useState({
    job_description: '',
    company_name: '',
    recipient_name: '',
    tone: 'professional',
    email_type: 'application',
  })
  const [emailData, setEmailData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [copied, setCopied] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })
    setEmailData(null)

    try {
      const res = await emailAPI.generate(form)
      setEmailData(res.data.email_data)
      setMsg({ text: 'Email generated!', type: 'success' })
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Generation failed.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const getFullEmail = () => {
    if (!emailData) return ''
    const parts = [
      `Subject: ${emailData.subject_line}`,
      '',
      emailData.greeting,
      '',
      ...(emailData.body_paragraphs || []).map(p => p + '\n'),
      emailData.sign_off,
      emailData.sender_name,
    ]
    return parts.join('\n')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFullEmail())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="page-header">
        <h2><span className="header-icon">📧</span> Cold Email Generator</h2>
      </div>

      <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />

      <div style={{ display: 'grid', gridTemplateColumns: emailData ? '1fr 1fr' : '1fr', gap: 24 }}>
        {/* Input Form */}
        <div className="form-section">
          <h3>📋 Email Details</h3>
          <form onSubmit={handleGenerate}>
            {/* Email Type */}
            <div className="form-group">
              <label>Email Type</label>
              <div className="type-grid">
                {TYPES.map(t => (
                  <div key={t.value}
                    className={`type-option ${form.email_type === t.value ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, email_type: t.value })}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Company Name</label>
                <input type="text" name="company_name" value={form.company_name}
                  onChange={handleChange} placeholder="Google, Microsoft..." />
              </div>
              <div className="form-group">
                <label>Recipient Name</label>
                <input type="text" name="recipient_name" value={form.recipient_name}
                  onChange={handleChange} placeholder="John Smith (optional)" />
              </div>
            </div>

            {/* Tone */}
            <div className="form-group">
              <label>Tone</label>
              <div className="tone-grid">
                {TONES.map(t => (
                  <div key={t.value}
                    className={`tone-option ${form.tone === t.value ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, tone: t.value })}>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Job Description *</label>
              <textarea name="job_description" value={form.job_description}
                onChange={handleChange} placeholder="Paste the job description..."
                required style={{ minHeight: 180 }} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (<><div className="spinner" style={{ width: 18, height: 18 }} /> Generating...</>)
                : '🤖 Generate Email'}
            </button>
          </form>
        </div>

        {/* Email Preview */}
        {emailData && (
          <div className="form-section">
            <h3>📨 Generated Email</h3>

            {/* Subject Line */}
            <div className="email-field">
              <label className="email-label">Subject:</label>
              <div className="email-subject">{emailData.subject_line}</div>
            </div>

            {/* Alternative Subjects */}
            {emailData.alternative_subjects?.length > 0 && (
              <div className="email-alternatives">
                <span style={{ fontSize: 11, color: '#888' }}>Alternatives: </span>
                {emailData.alternative_subjects.map((s, i) => (
                  <span key={i} className="alt-subject" onClick={() => {
                    setEmailData({ ...emailData, subject_line: s })
                  }}>{s}</span>
                ))}
              </div>
            )}

            {/* Email Body */}
            <div className="email-preview">
              <div className="email-greeting">{emailData.greeting}</div>
              {emailData.body_paragraphs?.map((p, i) => (
                <p key={i} className="email-paragraph">{p}</p>
              ))}
              <div className="email-signoff">{emailData.sign_off}</div>
              <div className="email-sender">{emailData.sender_name}</div>
            </div>

            {/* Tips */}
            {emailData.tips?.length > 0 && (
              <div className="email-tips">
                <h4>💡 Personalization Tips:</h4>
                <ul>
                  {emailData.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="btn-group">
              <button className="btn btn-success" onClick={copyToClipboard}>
                {copied ? '✅ Copied!' : '📋 Copy Email'}
              </button>
              <button className="btn btn-secondary" onClick={handleGenerate} disabled={loading}>
                🔄 Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}