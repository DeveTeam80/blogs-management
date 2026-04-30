'use client'

import { useState, useEffect } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function ViewOnSiteButton() {
  const { id } = useDocumentInfo()
  const [slug, setSlug] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/posts/${id}?depth=0`)
      .then((r) => r.json())
      .then((data) => {
        setSlug(data?.slug || null)
        setStatus(data?.status || null)
      })
      .catch(() => {})
  }, [id])

  // Hide if not published or no slug
  if (!slug || status !== 'published') return null

  return (
    <div>
      <a
        href={`/blog/${slug}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: '#fff',
          background: '#1a1a1a',
          padding: '9px 20px',
          borderRadius: 6,
          textDecoration: 'none',
        }}
      >
        View on Site
      </a>
    </div>
  )
}
