'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong')
        return
      }

      setStatus('done')
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fp-root {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Geist', sans-serif;
          padding: 24px;
        }

        .fp-logo { margin-bottom: 40px; animation: fadeDown 0.4s ease both; }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fp-card {
          width: 100%;
          max-width: 400px;
          animation: fadeUp 0.45s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fp-heading {
          font-family:  serif;
          font-size: 22px;
          color: #111;
          margin-bottom: 6px;
        }

        .fp-subtext {
          font-size: 13px;
          color: #888;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .fp-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
          color: #111;
          margin-bottom: 6px;
        }

        .fp-required { color: #e5484d; font-size: 13px; }

        .fp-input {
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
          margin-bottom: 20px;
        }

        .fp-input::placeholder { color: #bbb; }
        .fp-input:focus { border-color: #111; }

        .fp-error {
          font-size: 13px;
          color: #c0392b;
          margin-bottom: 16px;
          padding: 11px 13px;
          background: #fff5f5;
          border-radius: 6px;
          border: 1px solid #fcc;
        }

        .fp-btn {
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
        }

        .fp-btn:hover:not(:disabled) { background: #111; }
        .fp-btn:active:not(:disabled) { transform: scale(0.99); }
        .fp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .fp-spinner {
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

        .fp-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: #888;
        }

        .fp-footer a {
          color: #555;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
        }
        .fp-footer a:hover { color: #111; }

        .fp-success {
          text-align: center;
          padding: 20px 0;
          animation: fadeUp 0.4s ease both;
        }

        .fp-success-icon {
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

        .fp-success-title {
          font-family:  serif;
          font-size: 22px;
          color: #111;
          margin-bottom: 8px;
        }

        .fp-success-text {
          font-size: 13px;
          color: #888;
          line-height: 1.6;
        }
      `}</style>

      <div className="fp-root">
        <div className="fp-logo">
          <svg
            width="140"
            height="32"
            viewBox="0 0 140 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text x="0" y="24" fontSize="26" fill="#111" fontWeight={600} letterSpacing="-0.5">
              Blog CMS
            </text>
          </svg>
        </div>

        <div className="fp-card">
          {status === 'done' ? (
            <div className="fp-success">
              <div className="fp-success-icon">✓</div>
              <div className="fp-success-title">Check your inbox</div>
              <p className="fp-success-text">
                If an account exists for <strong style={{ color: '#555' }}>{email}</strong>,<br />
                you'll receive a reset link shortly.
              </p>
              <div className="fp-footer" style={{ marginTop: 24 }}>
                <Link href="/admin/login">← Back to login</Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="fp-heading">Reset your password</h1>
              <p className="fp-subtext">Enter your email and we'll send you a link to reset it.</p>

              <form onSubmit={handleSubmit}>
                <label className="fp-label" htmlFor="email">
                  Email <span className="fp-required">*</span>
                </label>
                <input
                  id="email"
                  className="fp-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />

                {status === 'error' && <div className="fp-error">{message}</div>}

                <button className="fp-btn" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' && <span className="fp-spinner" />}
                  {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="fp-footer">
                <Link href="/admin/login">← Back to login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
