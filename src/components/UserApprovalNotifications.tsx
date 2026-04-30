'use client'

import React, { useEffect, useState } from 'react'

type ApprovalRequest = {
  id: number | string
  userId: number
  name: string
  email: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export default function UserApprovalNotifications() {
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | number | null>(null)

  const fetchRequests = async () => {
    try {
      const res = await fetch(
        '/api/user-approvals?where[status][equals]=pending&sort=-createdAt&limit=20',
        {
          credentials: 'include',
        },
      )

      const data = await res.json()

      setRequests(data?.docs || [])
    } catch (error) {
      console.error('Failed to fetch approval requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAction = async (approvalId: string | number, action: 'approved' | 'rejected') => {
    try {
      setProcessingId(approvalId)

      const res = await fetch(`/api/user-approvals/${approvalId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data?.errors?.[0]?.message || 'Action failed')
        return
      }

      setRequests((prev) => prev.filter((item) => item.id !== approvalId))
    } catch (error) {
      console.error(error)
      alert('Something went wrong')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.loadingBox}>Loading approval requests...</div>
      </div>
    )
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>User Approval Requests</h2>
          <p style={styles.subtitle}>
            Review new signup requests and approve or reject account access.
          </p>
        </div>

        {requests.length > 0 && <span style={styles.badge}>{requests.length} pending</span>}
      </div>

      {requests.length === 0 ? (
        <div style={styles.emptyBox}>
          <div style={styles.emptyIcon}>✓</div>
          <h3 style={styles.emptyTitle}>No pending requests</h3>
          <p style={styles.emptyText}>New signup requests will appear here for admin review.</p>
        </div>
      ) : (
        <div style={styles.cardList}>
          {requests.map((request) => {
            const isProcessing = processingId === request.id

            return (
              <div key={request.id} style={styles.card}>
                <div style={styles.left}>
                  <div style={styles.avatar}>
                    {(request.name || request.email || 'U').charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={styles.nameRow}>
                      <h3 style={styles.name}>{request.name || 'New User'}</h3>
                      <span style={styles.newBadge}>New</span>
                    </div>

                    <p style={styles.email}>{request.email}</p>

                    <p style={styles.meta}>
                      Requested access on{' '}
                      {new Date(request.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div style={styles.actions}>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAction(request.id, 'approved')}
                    style={{
                      ...styles.button,
                      ...styles.approveButton,
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                  >
                    {isProcessing ? 'Processing...' : 'Approve'}
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAction(request.id, 'rejected')}
                    style={{
                      ...styles.button,
                      ...styles.rejectButton,
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    marginBottom: '28px',
    padding: '24px',
    borderRadius: '18px',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '18px',
  },

  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    color: '#111827',
  },

  subtitle: {
    margin: '6px 0 0',
    fontSize: '14px',
    color: '#6b7280',
  },

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '7px 12px',
    borderRadius: '999px',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '13px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },

  loadingBox: {
    padding: '18px',
    borderRadius: '14px',
    background: '#ffffff',
    color: '#6b7280',
    fontSize: '14px',
  },

  emptyBox: {
    padding: '34px',
    borderRadius: '16px',
    background: '#ffffff',
    border: '1px dashed #d1d5db',
    textAlign: 'center',
  },

  emptyIcon: {
    width: '42px',
    height: '42px',
    margin: '0 auto 12px',
    borderRadius: '999px',
    background: '#dcfce7',
    color: '#166534',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
  },

  emptyTitle: {
    margin: 0,
    fontSize: '17px',
    color: '#111827',
  },

  emptyText: {
    margin: '6px 0 0',
    color: '#6b7280',
    fontSize: '14px',
  },

  cardList: {
    display: 'grid',
    gap: '14px',
  },

  card: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '18px',
    alignItems: 'center',
    padding: '18px',
    borderRadius: '16px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.05)',
  },

  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minWidth: 0,
  },

  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '999px',
    background: '#111827',
    color: '#ffffff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
    flexShrink: 0,
  },

  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  name: {
    margin: 0,
    fontSize: '16px',
    color: '#111827',
    fontWeight: 700,
  },

  newBadge: {
    padding: '4px 8px',
    borderRadius: '999px',
    background: '#eff6ff',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: 700,
  },

  email: {
    margin: '4px 0',
    color: '#374151',
    fontSize: '14px',
  },

  meta: {
    margin: 0,
    color: '#9ca3af',
    fontSize: '12px',
  },

  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },

  button: {
    border: 0,
    borderRadius: '999px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  approveButton: {
    background: '#16a34a',
    color: '#ffffff',
  },

  rejectButton: {
    background: '#fee2e2',
    color: '#991b1b',
  },
}
