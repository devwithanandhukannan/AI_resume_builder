import { useState } from 'react'
import { interviewAPI } from '../api/axios'
import MessageAlert from '../components/MessageAlert'

const QUESTION_TYPES = [
  { value: 'aptitude', icon: '🧮', label: 'Aptitude Test', desc: 'MCQ - Math, Logic, Verbal reasoning' },
  { value: 'hr', icon: '👥', label: 'HR Interview', desc: 'Behavioral & personality questions' },
  { value: 'technical', icon: '💻', label: 'Technical', desc: 'Coding, system design, concepts' },
  { value: 'behavioral', icon: '🎯', label: 'Behavioral (STAR)', desc: 'Situation-Task-Action-Result' },
  { value: 'mock', icon: '🎤', label: 'Mock Interview', desc: 'Full interview simulation' },
]

const DIFFICULTIES = [
  { value: 'easy', label: '🟢 Easy' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'hard', label: '🔴 Hard' },
]

export default function InterviewPrep() {
  const [step, setStep] = useState('setup')
  const [form, setForm] = useState({
    job_description: '',
    question_type: 'hr',
    count: 10,
    difficulty: 'medium',
  })
  const [questionsData, setQuestionsData] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [showAnswers, setShowAnswers] = useState({})

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })
    setQuestionsData(null)
    setResults(null)
    setUserAnswers({})
    setShowAnswers({})

    try {
      const res = await interviewAPI.generate(form)
      setQuestionsData(res.data.data)
      setStep('questions')
      setMsg({ text: `${form.question_type.toUpperCase()} questions generated!`, type: 'success' })
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Generation failed.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (qid, answer) => {
    setUserAnswers({ ...userAnswers, [qid]: answer })
  }

  const handleSubmitAptitude = async () => {
    setChecking(true)
    try {
      const questions = questionsData?.questions || []
      const res = await interviewAPI.checkAnswers({ questions, user_answers: userAnswers })
      setResults(res.data.results)
      setStep('results')
      setMsg({ text: `Score: ${res.data.results.score}/${res.data.results.total} (${res.data.results.percentage}%)`, type: 'success' })
    } catch (err) {
      setMsg({ text: 'Failed to check answers.', type: 'error' })
    } finally {
      setChecking(false)
    }
  }

  const toggleAnswer = (id) => {
    setShowAnswers({ ...showAnswers, [id]: !showAnswers[id] })
  }

  const resetAll = () => {
    setStep('setup')
    setQuestionsData(null)
    setResults(null)
    setUserAnswers({})
    setShowAnswers({})
  }

  return (
    <div>
      <div className="page-header">
        <h2><span className="header-icon">🎯</span> Interview Preparation</h2>
        {step !== 'setup' && (
          <button className="btn btn-secondary" onClick={resetAll}>← New Session</button>
        )}
      </div>

      <MessageAlert message={msg.text} type={msg.type} onClose={() => setMsg({ text: '', type: '' })} />

      {/* SETUP */}
      {step === 'setup' && (
        <div className="form-section">
          <h3>⚙️ Configure Interview Session</h3>
          <form onSubmit={handleGenerate}>
            {/* Question Type */}
            <div className="form-group">
              <label>Question Type</label>
              <div className="qtype-grid">
                {QUESTION_TYPES.map(t => (
                  <div key={t.value}
                    className={`qtype-option ${form.question_type === t.value ? 'selected' : ''}`}
                    onClick={() => setForm({ ...form, question_type: t.value })}>
                    <div className="qtype-icon">{t.icon}</div>
                    <div className="qtype-label">{t.label}</div>
                    <div className="qtype-desc">{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Number of Questions</label>
                <select name="count" value={form.count} onChange={handleChange}>
                  {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} questions</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Difficulty</label>
                <div className="diff-grid">
                  {DIFFICULTIES.map(d => (
                    <div key={d.value}
                      className={`diff-option ${form.difficulty === d.value ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, difficulty: d.value })}>
                      {d.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Job Description *</label>
              <textarea name="job_description" value={form.job_description}
                onChange={handleChange} placeholder="Paste the job description here..."
                required style={{ minHeight: 180 }} />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (<><div className="spinner" style={{ width: 18, height: 18 }} /> Generating Questions...</>)
                : '🤖 Generate Questions'}
            </button>
          </form>
        </div>
      )}

      {/* APTITUDE QUESTIONS */}
      {step === 'questions' && form.question_type === 'aptitude' && questionsData?.questions && (
        <div>
          <div className="quiz-header">
            <h3>🧮 Aptitude Test</h3>
            <div className="quiz-progress">
              {Object.keys(userAnswers).length} / {questionsData.questions.length} answered
            </div>
          </div>

          {questionsData.questions.map((q, idx) => (
            <div key={q.id} className="quiz-question">
              <div className="quiz-q-header">
                <span className="quiz-q-num">Q{idx + 1}</span>
                <span className="quiz-q-cat">{q.category}</span>
                <span className={`quiz-q-diff ${q.difficulty}`}>{q.difficulty}</span>
              </div>
              <p className="quiz-q-text">{q.question}</p>
              <div className="quiz-options">
                {Object.entries(q.options).map(([key, value]) => (
                  <div key={key}
                    className={`quiz-option ${userAnswers[q.id] === key ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(q.id, key)}>
                    <span className="option-key">{key}</span>
                    <span className="option-text">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="btn-group" style={{ justifyContent: 'center', padding: '20px 0' }}>
            <button className="btn btn-success" onClick={handleSubmitAptitude}
              disabled={checking || Object.keys(userAnswers).length === 0}>
              {checking ? 'Checking...' : `✅ Submit Answers (${Object.keys(userAnswers).length}/${questionsData.questions.length})`}
            </button>
          </div>
        </div>
      )}

      {/* APTITUDE RESULTS */}
      {step === 'results' && results && (
        <div>
          <div className="results-summary">
            <div className="results-score">
              <div className="score-circle" style={{
                borderColor: results.percentage >= 75 ? '#2ecc71' : results.percentage >= 50 ? '#f39c12' : '#e74c3c'
              }}>
                <span className="score-num">{results.percentage}%</span>
              </div>
              <div className="score-text">
                <div className="score-fraction">{results.score} / {results.total} correct</div>
                <div className="score-grade">{results.grade}</div>
              </div>
            </div>
          </div>

          {results.results.map((r, idx) => (
            <div key={r.id} className={`result-card ${r.is_correct ? 'correct' : 'wrong'}`}>
              <div className="result-header">
                <span className="result-icon">{r.is_correct ? '✅' : '❌'}</span>
                <span className="result-q-num">Q{idx + 1}</span>
                <span className="quiz-q-cat">{r.category}</span>
              </div>
              <p className="result-question">{r.question}</p>
              <div className="result-answers">
                <div className={`result-answer ${r.is_correct ? 'correct' : 'wrong'}`}>
                  Your answer: <strong>{r.your_answer || 'Not answered'}</strong>
                </div>
                {!r.is_correct && (
                  <div className="result-answer correct">
                    Correct answer: <strong>{r.correct_answer}</strong>
                  </div>
                )}
              </div>
              <div className="result-explanation">
                <strong>📖 Explanation:</strong> {r.explanation}
              </div>
            </div>
          ))}

          <div className="btn-group" style={{ justifyContent: 'center', padding: '20px 0' }}>
            <button className="btn btn-primary" onClick={resetAll}>🔄 New Session</button>
          </div>
        </div>
      )}

      {/* HR / TECHNICAL / BEHAVIORAL QUESTIONS */}
      {step === 'questions' && ['hr', 'technical', 'behavioral'].includes(form.question_type) && questionsData?.questions && (
        <div>
          <div className="quiz-header">
            <h3>
              {form.question_type === 'hr' && '👥 HR Interview Questions'}
              {form.question_type === 'technical' && '💻 Technical Questions'}
              {form.question_type === 'behavioral' && '🎯 Behavioral Questions (STAR)'}
            </h3>
          </div>

          {questionsData.questions.map((q, idx) => (
            <div key={q.id} className="interview-card">
              <div className="interview-q-header">
                <span className="quiz-q-num">Q{idx + 1}</span>
                <span className="quiz-q-cat">{q.category}</span>
                {q.difficulty && <span className={`quiz-q-diff ${q.difficulty}`}>{q.difficulty}</span>}
              </div>

              <p className="interview-question">{q.question}</p>

              <button className="btn btn-secondary" style={{ marginTop: 10 }}
                onClick={() => toggleAnswer(q.id)}>
                {showAnswers[q.id] ? '🙈 Hide Answer' : '👁️ Show Answer'}
              </button>

              {showAnswers[q.id] && (
                <div className="interview-answer">
                  {/* HR / Technical */}
                  {q.suggested_answer && (
                    <div className="answer-section">
                      <h4>💡 Suggested Answer:</h4>
                      <p>{q.suggested_answer}</p>
                    </div>
                  )}

                  {/* Behavioral STAR */}
                  {q.star_answer && (
                    <div className="star-answer">
                      <div className="star-item">
                        <span className="star-label">🔹 Situation</span>
                        <p>{q.star_answer.situation}</p>
                      </div>
                      <div className="star-item">
                        <span className="star-label">🔹 Task</span>
                        <p>{q.star_answer.task}</p>
                      </div>
                      <div className="star-item">
                        <span className="star-label">🔹 Action</span>
                        <p>{q.star_answer.action}</p>
                      </div>
                      <div className="star-item">
                        <span className="star-label">🔹 Result</span>
                        <p>{q.star_answer.result}</p>
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {q.tips?.length > 0 && (
                    <div className="answer-tips">
                      <h4>📌 Tips:</h4>
                      <ul>{q.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                    </div>
                  )}

                  {q.what_they_look_for && (
                    <div className="look-for">
                      <strong>🔍 What they look for:</strong> {q.what_they_look_for}
                    </div>
                  )}

                  {q.common_mistakes && (
                    <div className="common-mistakes">
                      <strong>⚠️ Avoid:</strong> {q.common_mistakes}
                    </div>
                  )}

                  {q.key_points?.length > 0 && (
                    <div className="key-points">
                      <strong>🔑 Key Points:</strong>
                      <ul>{q.key_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    </div>
                  )}

                  {q.follow_up && (
                    <div className="follow-up">
                      <strong>➡️ Follow-up:</strong> {q.follow_up}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MOCK INTERVIEW */}
      {step === 'questions' && form.question_type === 'mock' && questionsData?.interview_flow && (
        <div>
          <div className="quiz-header">
            <h3>🎤 Mock Interview Simulation</h3>
          </div>

          {questionsData.overall_tips?.length > 0 && (
            <div className="mock-tips">
              <h4>📋 General Interview Tips:</h4>
              <ul>{questionsData.overall_tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          )}

          {questionsData.interview_flow.map((q, idx) => (
            <div key={q.id} className="interview-card">
              <div className="interview-q-header">
                <span className="quiz-q-num">Q{idx + 1}</span>
                <span className="quiz-q-cat">{q.phase}</span>
                <span className={`mock-type ${q.type?.toLowerCase()}`}>{q.type}</span>
                {q.time_suggested && <span className="time-badge">⏱️ {q.time_suggested}</span>}
              </div>

              <p className="interview-question">{q.question}</p>

              <button className="btn btn-secondary" style={{ marginTop: 10 }}
                onClick={() => toggleAnswer(q.id)}>
                {showAnswers[q.id] ? '🙈 Hide Answer' : '👁️ Show Answer'}
              </button>

              {showAnswers[q.id] && (
                <div className="interview-answer">
                  <div className="answer-section">
                    <h4>💡 Ideal Answer:</h4>
                    <p>{q.ideal_answer}</p>
                  </div>
                  {q.scoring_criteria && (
                    <div className="scoring">
                      <strong>📊 Scoring:</strong> {q.scoring_criteria}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}