'use client'

export default function ViewAllBlogsButton() {
  return (
    <div style={{ marginBottom: 20 }}>
      <a
        href="/blog"
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
        View All Blogs
      </a>
    </div>
  )
}
