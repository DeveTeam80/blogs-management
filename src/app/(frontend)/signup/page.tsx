'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [done, setDone] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)

    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      let data = null
      try {
        data = await res.json()
      } catch {
        data = null
      }

      if (!res.ok) {
        setIsError(true)
        setMessage(data?.error || 'Signup failed')
        return
      }

      setDone(true)
      setForm({ name: '', email: '', password: '' })
    } catch {
      setIsError(true)
      setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .su-root {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: sans-serif;
          padding: 24px;
        }

        .su-logo {
          margin-bottom: 40px;
          animation: fadeDown 0.4s ease both;
        }

        .su-logo svg {
          width: 140px;
          height: auto;
        }

        .su-card {
          width: 100%;
          max-width: 400px;
          animation: fadeUp 0.45s ease both;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .su-field {
          margin-bottom: 20px;
        }

        .su-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
          color: #111;
          margin-bottom: 6px;
        }

        .su-required {
          color: #e5484d;
          font-size: 13px;
        }

        .su-input {
          width: 100%;
          padding: 10px 12px;
          font-size: 14px;
          font-family: 'Geist', sans-serif;
          color: #111;
          background: #fff;
          border: 1.5px solid #e0e0e0;
          border-radius: 6px;
          outline: none;
          transition: border-color 0.15s;
          -webkit-appearance: none;
        }

        .su-input::placeholder { color: #bbb; }

        .su-input:focus {
          border-color: #111;
        }

        .su-btn {
          width: 100%;
          padding: 11px;
          background: #333;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'Geist', sans-serif;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          margin-top: 4px;
        }

        .su-btn:hover:not(:disabled) { background: #111; }
        .su-btn:active:not(:disabled) { transform: scale(0.99); }
        .su-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .su-spinner {
          display: inline-block;
          width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          vertical-align: middle;
          margin-right: 7px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .su-msg {
          margin-top: 16px;
          padding: 11px 13px;
          border-radius: 6px;
          font-size: 13px;
          line-height: 1.5;
          text-align: center;
        }

        .su-msg.error {
          background: #fff5f5;
          color: #c0392b;
          border: 1px solid #fcc;
        }

        .su-msg.success {
          background: #f0faf4;
          color: #1a7f4b;
          border: 1px solid #b7e4c7;
        }

        .su-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: #888;
        }

        .su-footer a {
          color: #555;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
        }

        .su-footer a:hover { color: #111; }

        .su-success-state {
          text-align: center;
          padding: 20px 0;
          animation: fadeUp 0.4s ease both;
        }

        .su-check {
          width: 48px; height: 48px;
          border-radius: 50%;
          border: 1.5px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 20px;
          color: #1a7f4b;
        }

        .su-success-title {
          font-family:  serif;
          font-size: 22px;
          color: #111;
          margin-bottom: 8px;
        }

        .su-success-text {
          font-size: 13px;
          color: #888;
          line-height: 1.6;
        }
      `}</style>

      <div className="su-root">
        {/* Logo — matches Payload admin style */}
        <div className="su-logo">
          <svg viewBox="0 0 140 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="24" fontSize="26" fontWeight={600} fill="#111" letterSpacing="-0.5">
              Blog CMS
            </text>
          </svg>
        </div>

        <div className="su-card">
          {done ? (
            <div className="su-success-state">
              <div className="su-check">✓</div>
              <div className="su-success-title">Account created</div>
              <p className="su-success-text">
                Your request is pending admin approval.
                <br />
                You'll receive an email once approved.
              </p>
              <div className="su-footer" style={{ marginTop: 24 }}>
                <Link href="/admin/login">Back to login</Link>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                <div className="su-field">
                  <label className="su-label" htmlFor="name">
                    Name <span className="su-required">*</span>
                  </label>
                  <input
                    id="name"
                    className="su-input"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>

                <div className="su-field">
                  <label className="su-label" htmlFor="email">
                    Email <span className="su-required">*</span>
                  </label>
                  <input
                    id="email"
                    className="su-input"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="su-field">
                  <label className="su-label" htmlFor="password">
                    Password <span className="su-required">*</span>
                  </label>
                  <input
                    id="password"
                    className="su-input"
                    name="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>

                {message && (
                  <div className={`su-msg ${isError ? 'error' : 'success'}`}>{message}</div>
                )}

                <button className="su-btn" type="submit" disabled={loading}>
                  {loading && <span className="su-spinner" />}
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div className="su-footer">
                Already have an account? <Link href="/admin/login">Log in</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
