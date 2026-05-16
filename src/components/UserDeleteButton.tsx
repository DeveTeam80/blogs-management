'use client'

// This is a Payload UI field added to the Users collection.
// It shows a "Delete this user" danger zone on the edit page.
// When clicked, it dispatches the 'payload-delete-user' event which
// AdminTransferDeleteModal listens to.
//
// Add to Users.ts fields array:
//   {
//     name: 'deleteUserAction',
//     type: 'ui',
//     admin: {
//       components: {
//         Field: '@/components/UserDeleteButton#default',
//       },
//     },
//   }

import { useEffect, useState } from 'react'
import { useAuth } from '@payloadcms/ui'
import { useDocumentInfo } from '@payloadcms/ui'

export default function UserDeleteButton() {
  const { user: currentUser } = useAuth()
  const { id: docId, title: docTitle } = useDocumentInfo()
  const cu = currentUser as any
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!cu) return
    const isAdminOrMaster = cu.role === 'admin' || cu.role === 'master-admin'
    const isOwnProfile = String(cu.id) === String(docId)
    // Show only when admin/master-admin is viewing ANOTHER user's edit page
    setShow(isAdminOrMaster && !isOwnProfile && !!docId)
  }, [cu, docId])

  if (!show) return null

  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent('payload-delete-user', {
        detail: {
          userId: Number(docId),
          userName: docTitle || `User #${docId}`,
        },
      }),
    )
  }

  return (
    <div style={S.container}>
      <div style={S.dangerZone}>
        <div>
          <div style={S.title}>Delete This User</div>
          <div style={S.sub}>Remove this user and choose what happens to their blog posts.</div>
        </div>
        <button onClick={handleClick} style={S.btn}>
          Delete User
        </button>
      </div>
    </div>
  )
}

const S: Record<string, React.CSSProperties> = {
  container: { marginTop: 32 },
  dangerZone: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    padding: '16px 20px',
    border: '1px solid #fecaca',
    borderRadius: 8,
    background: '#fef2f2',
  },
  title: { fontSize: 14, fontWeight: 600, color: '#991b1b', marginBottom: 4 },
  sub: { fontSize: 13, color: '#6b7280' },
  btn: {
    padding: '8px 18px',
    borderRadius: 6,
    border: 'none',
    background: '#dc2626',
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
}
