'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error' | 'invalid'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) setStatus('invalid')
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirm) {
      setStatus('error')
      setMessage('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setStatus('error')
      setMessage('Password must be at least 8 characters.')
      return
    }

    setStatus('loading')

    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong.')
        return
      }

      setStatus('done')
      setTimeout(() => router.push('/admin/login'), 2500)
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

        .rp-root {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Geist', sans-serif;
          padding: 24px;
        }

        .rp-logo { margin-bottom: 40px; animation: fadeDown 0.4s ease both; }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .rp-card {
          width: 100%;
          max-width: 400px;
          animation: fadeUp 0.45s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .rp-heading {
          font-family: serif;
          font-size: 22px;
          color: #111;
          margin-bottom: 6px;
        }

        .rp-subtext {
          font-size: 13px;
          color: #888;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .rp-field { margin-bottom: 20px; }

        .rp-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
          color: #111;
          margin-bottom: 6px;
        }

        .rp-required { color: #e5484d; font-size: 13px; }

        .rp-input {
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

        .rp-input::placeholder { color: #bbb; }
        .rp-input:focus { border-color: #111; }

        .rp-hint {
          font-size: 12px;
          color: #bbb;
          margin-top: 5px;
        }

        .rp-error {
          font-size: 13px;
          color: #c0392b;
          margin-bottom: 16px;
          padding: 11px 13px;
          background: #fff5f5;
          border-radius: 6px;
          border: 1px solid #fcc;
        }

        .rp-btn {
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

        .rp-btn:hover:not(:disabled) { background: #111; }
        .rp-btn:active:not(:disabled) { transform: scale(0.99); }
        .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .rp-spinner {
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

        .rp-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: #888;
        }

        .rp-footer a {
          color: #555;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s;
        }
        .rp-footer a:hover { color: #111; }

        .rp-success {
          text-align: center;
          padding: 20px 0;
          animation: fadeUp 0.4s ease both;
        }

        .rp-success-icon {
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

        .rp-success-title {
          font-family: serif;
          font-size: 22px;
          color: #111;
          margin-bottom: 8px;
        }

        .rp-success-text {
          font-size: 13px;
          color: #888;
          line-height: 1.6;
        }

        .rp-invalid {
          text-align: center;
          padding: 20px 0;
        }

        .rp-invalid-icon {
          font-size: 28px;
          margin-bottom: 16px;
          color: #e5484d;
        }

        .rp-invalid-title {
          font-family:  serif;
          font-size: 22px;
          color: #111;
          margin-bottom: 8px;
        }

        .rp-invalid-text {
          font-size: 13px;
          color: #888;
          line-height: 1.6;
        }
      `}</style>

      <div className="rp-root">
        <div className="rp-logo">
          <svg
            width="140"
            height="32"
            viewBox="0 0 140 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="0"
              y="24"
              fontFamily="serif"
              fontWeight={600}
              fontSize="26"
              fill="#111"
              letterSpacing="-0.5"
            >
              Blog CMS
            </text>
          </svg>
        </div>

        <div className="rp-card">
          {status === 'invalid' && (
            <div className="rp-invalid">
              <div className="rp-invalid-icon">⚠</div>
              <div className="rp-invalid-title">Invalid link</div>
              <p className="rp-invalid-text">
                This reset link is missing or invalid.
                <br />
                Please request a new one.
              </p>
              <div className="rp-footer" style={{ marginTop: 24 }}>
                <Link href="/forgot-password">Request new link</Link>
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="rp-success">
              <div className="rp-success-icon">✓</div>
              <div className="rp-success-title">Password updated</div>
              <p className="rp-success-text">
                Your password has been reset.
                <br />
                Redirecting you to login...
              </p>
            </div>
          )}

          {(status === 'idle' || status === 'loading' || status === 'error') && (
            <>
              <h1 className="rp-heading">Set a new password</h1>
              <p className="rp-subtext">Choose something strong and memorable.</p>

              <form onSubmit={handleSubmit}>
                <div className="rp-field">
                  <label className="rp-label" htmlFor="password">
                    New Password <span className="rp-required">*</span>
                  </label>
                  <input
                    id="password"
                    className="rp-input"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoFocus
                  />
                  <p className="rp-hint">At least 8 characters</p>
                </div>

                <div className="rp-field">
                  <label className="rp-label" htmlFor="confirm">
                    Confirm Password <span className="rp-required">*</span>
                  </label>
                  <input
                    id="confirm"
                    className="rp-input"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>

                {status === 'error' && <div className="rp-error">{message}</div>}

                <button className="rp-btn" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' && <span className="rp-spinner" />}
                  {status === 'loading' ? 'Updating...' : 'Update Password'}
                </button>
              </form>

              <div className="rp-footer">
                <Link href="/forgot-password">← Request a new link</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
