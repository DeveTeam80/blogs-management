'use client'

import { useAuth } from '@payloadcms/ui'

export default function DeleteAccountLink() {
  const { user } = useAuth()

  // Only show for normal users, not admin/master-admin
  if (!user || (user as any).role !== 'user') return null

  return (
    <div style={{ padding: '16px 0 0', textAlign: 'center' }}>
      <a
        href="/delete-account"
        style={{
          fontSize: 12,
          color: '#e5484d',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          cursor: 'pointer',
        }}
      >
        Delete my account
      </a>
    </div>
  )
}
