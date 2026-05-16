'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type User = { id: number; email: string; name?: string | null; role: string }

export default function DeleteAccountPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [reassignTo, setReassignTo] = useState<string>('none')
  const [step, setStep] = useState<'choose' | 'confirm' | 'done'>('choose')
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [postCount, setPostCount] = useState(0)

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then(async (data) => {
        const me = data?.user || null
        setCurrentUser(me)
        if (me?.id) {
          const postsRes = await fetch(
            `/api/posts?where[author][equals]=${me.id}&limit=0&depth=0`,
            { credentials: 'include' },
          )
          const postsData = await postsRes.json()
          setPostCount(postsData?.totalDocs || 0)
        }
      })

    // Use transfer-list which bypasses access control
    fetch('/api/users/transfer-list', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setUsers(data?.users || []))
  }, [])

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch('/api/users/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reassignTo: reassignTo !== 'none' ? Number(reassignTo) : null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to delete account')
        return
      }
      setStep('done')
      setTimeout(() => router.push('/'), 3000)
    } catch {
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const selectedUserLabel =
    reassignTo !== 'none'
      ? users.find((u) => String(u.id) === reassignTo)?.name ||
        users.find((u) => String(u.id) === reassignTo)?.email ||
        'selected user'
      : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .da-root {
          min-height: 100vh; background: #fff; display: flex;
          flex-direction: column; align-items: center; justify-content: center;
          font-family: 'Geist', sans-serif; padding: 24px;
        }
        .da-card { width: 100%; max-width: 460px; animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .da-title { font-family: 'Instrument Serif', serif; font-size: 28px; color: #111; margin-bottom: 8px; }
        .da-sub { font-size: 14px; color: #888; line-height: 1.6; margin-bottom: 24px; }
        .da-divider { height: 1px; background: #f0f0f0; margin-bottom: 24px; }

        .da-post-count {
          background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;
          padding: 12px 14px; font-size: 13px; color: #92400e; margin-bottom: 20px;
        }

        .da-label { font-size: 13px; font-weight: 500; color: #111; margin-bottom: 10px; display: block; }

        .da-radio-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
        .da-radio-option {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 12px; border: 1.5px solid #e0e0e0; border-radius: 6px;
          cursor: pointer; font-size: 13px; color: #111; background: #fff;
        }
        .da-radio-option input { margin-top: 2px; accent-color: #111; flex-shrink: 0; }
        .da-radio-sub { color: #888; font-size: 12px; margin-top: 2px; }

        .da-select {
          width: 100%; padding: 10px 12px; font-size: 14px;
          font-family: 'Geist', sans-serif; color: #111; background: #fff;
          border: 1.5px solid #e0e0e0; border-radius: 6px; outline: none;
          margin-bottom: 16px; transition: border-color 0.15s;
        }
        .da-select:focus { border-color: #111; }

        .da-warning {
          background: #fff5f5; border: 1px solid #fcc; border-radius: 6px;
          padding: 14px; font-size: 13px; color: #c0392b; line-height: 1.6; margin-bottom: 24px;
        }
        .da-btn {
          width: 100%; padding: 11px; border: none; border-radius: 6px;
          font-size: 14px; font-weight: 500; font-family: 'Geist', sans-serif;
          cursor: pointer; transition: background 0.15s; margin-bottom: 12px;
        }
        .da-btn--danger { background: #e5484d; color: #fff; }
        .da-btn--danger:hover:not(:disabled) { background: #c0392b; }
        .da-btn--danger:disabled { opacity: 0.5; cursor: not-allowed; }
        .da-btn--ghost { background: transparent; color: #888; border: 1px solid #e0e0e0; }
        .da-btn--ghost:hover { color: #111; border-color: #bbb; }
        .da-spinner {
          display: inline-block; width: 13px; height: 13px;
          border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.6s linear infinite;
          vertical-align: middle; margin-right: 7px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .da-success { text-align: center; padding: 20px 0; }
        .da-success-icon {
          width: 52px; height: 52px; border-radius: 50%; border: 1.5px solid #e0e0e0;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px; font-size: 22px; color: #1a7f4b;
        }
        .da-success-title { font-family: 'Instrument Serif', serif; font-size: 24px; color: #111; margin-bottom: 8px; }
        .da-success-text { font-size: 13px; color: #888; line-height: 1.6; }
      `}</style>

      <div className="da-root">
        <div className="da-card">
          {step === 'done' ? (
            <div className="da-success">
              <div className="da-success-icon">✓</div>
              <div className="da-success-title">Account deleted</div>
              <p className="da-success-text">
                Your account has been permanently deleted.
                <br />
                Redirecting...
              </p>
            </div>
          ) : step === 'confirm' ? (
            <>
              <h1 className="da-title">Are you sure?</h1>
              <p className="da-sub">
                This is permanent and cannot be undone.
                {reassignTo !== 'none' && selectedUserLabel
                  ? ` Your posts will be transferred to ${selectedUserLabel}.`
                  : ` Your posts will have no author (common/uncategorised).`}
              </p>
              <div className="da-divider" />
              <button className="da-btn da-btn--danger" onClick={handleDelete} disabled={loading}>
                {loading && <span className="da-spinner" />}
                {loading ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button className="da-btn da-btn--ghost" onClick={() => setStep('choose')}>
                Go back
              </button>
            </>
          ) : (
            <>
              <h1 className="da-title">Delete your account</h1>
              <p className="da-sub">Choose what happens to your posts, then confirm.</p>
              <div className="da-divider" />

              {postCount > 0 && (
                <div className="da-post-count">
                  📝 You have{' '}
                  <strong>
                    {postCount} post{postCount > 1 ? 's' : ''}
                  </strong>
                  . Choose what to do with {postCount > 1 ? 'them' : 'it'}:
                </div>
              )}

              {postCount > 0 && (
                <>
                  <label className="da-label">Transfer posts to:</label>
                  <div className="da-radio-group">
                    <label className="da-radio-option">
                      <input
                        type="radio"
                        name="transfer"
                        value="none"
                        checked={reassignTo === 'none'}
                        onChange={() => setReassignTo('none')}
                      />
                      <div>
                        No one
                        <div className="da-radio-sub">
                          Posts will have no author (common / uncategorised)
                        </div>
                      </div>
                    </label>

                    <label className="da-radio-option">
                      <input
                        type="radio"
                        name="transfer"
                        value="other"
                        checked={reassignTo !== 'none'}
                        onChange={() => {
                          if (users.length > 0) setReassignTo(String(users[0].id))
                        }}
                      />
                      <div>
                        Transfer to another user
                        <div className="da-radio-sub">Pick from the list below</div>
                      </div>
                    </label>
                  </div>

                  {reassignTo !== 'none' && (
                    <select
                      className="da-select"
                      value={reassignTo}
                      onChange={(e) => setReassignTo(e.target.value)}
                    >
                      {users.length === 0 ? (
                        <option>No other users found</option>
                      ) : (
                        users.map((u) => (
                          <option key={u.id} value={String(u.id)}>
                            {u.name ? `${u.name} (${u.email})` : u.email}
                            {u.role !== 'user' ? ` — ${u.role}` : ''}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </>
              )}

              <div className="da-warning">
                ⚠ Deleting your account is permanent. You will lose access immediately.
              </div>
              <button className="da-btn da-btn--danger" onClick={() => setStep('confirm')}>
                Continue
              </button>
              <button className="da-btn da-btn--ghost" onClick={() => router.back()}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
