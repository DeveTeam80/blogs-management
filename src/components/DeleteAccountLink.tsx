'use client'

// src/components/DeleteAccountLink.tsx
//
// Shown in Payload admin nav after links (afterNavLinks).
// Any logged-in user clicking this goes to the self-delete flow at /delete-account.
// Works for user / admin / master-admin — all can delete their own account.

import { useAuth } from '@payloadcms/ui'

export default function DeleteAccountLink() {
  const { user } = useAuth()

  // Don't show if not logged in
  if (!user) return null

  return (
    <div style={{ padding: '8px 16px', marginTop: 4 }}>
      <a
        href="/delete-account"
        style={{
          display: 'block',
          fontSize: 12,
          color: '#e5484d',
          textDecoration: 'none',
          padding: '6px 8px',
          borderRadius: 6,
          border: '1px solid rgba(229, 72, 77, 0.3)',
          textAlign: 'center',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.background = 'rgba(229,72,77,0.08)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
        }}
      >
        Delete my account
      </a>
    </div>
  )
}
