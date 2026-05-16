import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

async function getPosts() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedDate',
    depth: 1,
    limit: 50,
    overrideAccess: true,
  })
  return posts.docs
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,600;1,6..72,400&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .blog-root {
          min-height: 100vh;
          background: #faf9f7;
          font-family: 'Outfit', sans-serif;
          color: #1a1a1a;
        }

        /* ── Navbar ── */
        .blog-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(250, 249, 247, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }

        .blog-nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 32px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .blog-nav-logo {
          font-family:  serif;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          text-decoration: none;
          letter-spacing: -0.5px;
        }

        .blog-nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .blog-nav-link {
          font-size: 13px;
          font-weight: 400;
          color: #777;
          text-decoration: none;
          padding: 6px 14px;
          border-radius: 100px;
          transition: all 0.2s;
        }

        .blog-nav-link:hover {
          color: #1a1a1a;
          background: rgba(0,0,0,0.04);
        }

        .blog-nav-link--admin {
          font-weight: 500;
          background: #1a1a1a;
          color: #fff;
          padding: 6px 18px;
        }

        .blog-nav-link--admin:hover {
          background: #333;
          color: #fff;
        }

        /* ── Hero ── */
        .blog-hero {
          max-width: 1100px;
          margin: 0 auto;
          padding: 72px 32px 56px;
        }

        .blog-hero-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #b5a997;
          margin-bottom: 20px;
        }

        .blog-hero-title {
          font-family:  serif;
          font-size: clamp(44px, 6vw, 72px);
          font-weight: 300;
          line-height: 1.05;
          letter-spacing: -1.5px;
          color: #1a1a1a;
          margin-bottom: 20px;
        }

        .blog-hero-title em {
          font-style: italic;
          font-weight: 400;
        }

        .blog-hero-desc {
          font-size: 16px;
          font-weight: 300;
          color: #999;
          max-width: 400px;
          line-height: 1.6;
        }

        .blog-hero-line {
          width: 100%;
          height: 1px;
          background: rgba(0,0,0,0.07);
          margin-top: 56px;
        }

        /* ── Count ── */
        .blog-count {
          max-width: 1100px;
          margin: 0 auto;
          padding: 28px 32px 0;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.08em;
          color: #bbb;
          text-transform: uppercase;
        }

        /* ── Grid ── */
        .blog-grid {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px 32px 100px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 860px) {
          .blog-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 560px) {
          .blog-grid { grid-template-columns: 1fr; }
          .blog-hero { padding: 48px 20px 40px; }
          .blog-grid { padding: 24px 20px 80px; }
          .blog-nav-inner { padding: 0 20px; }
          .blog-count { padding: 20px 20px 0; }
        }

        /* ── Card ── */
        .blog-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          animation: cardIn 0.45s ease both;
        }

        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.06);
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .blog-card-img {
          width: 100%;
          aspect-ratio: 3/2;
          object-fit: cover;
          background: #f0ece6;
        }

        .blog-card-placeholder {
          width: 100%;
          aspect-ratio: 3/2;
          background: linear-gradient(145deg, #f0ece6 0%, #e8e2d8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family:  serif;
          font-size: 28px;
          font-style: italic;
          color: #ccc;
        }

        .blog-card-body {
          padding: 24px 22px 28px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .blog-card-date {
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c4b8a8;
          margin-bottom: 5px;
        }

        .blog-card-title {
          font-family:  serif;
          font-size: 20px;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1.35;
          letter-spacing: -0.3px;
          margin-bottom: 6px;
          flex: 1;
        }

        .blog-card-author {
          font-size: 12px;
          color: #aaa;
        }

        .blog-card-read {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #b5a997;
          margin-top: 8px;
          transition: color 0.2s;
        }

        .blog-card:hover .blog-card-read { color: #8b7355; }

        /* ── Empty ── */
        .blog-empty {
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 32px;
          text-align: center;
        }

        .blog-empty-icon {
          font-size: 40px;
          margin-bottom: 16px;
          opacity: 0.3;
        }

        .blog-empty-title {
          font-family:  serif;
          font-size: 24px;
          font-weight: 300;
          color: #bbb;
          margin-bottom: 8px;
        }

        .blog-empty-text {
          font-size: 14px;
          color: #ccc;
        }
      `}</style>

      <div className="blog-root">
        <nav className="blog-nav">
          <div className="blog-nav-inner">
            <Link href="/blog" className="blog-nav-logo">
              The Blog
            </Link>
            <div className="blog-nav-links">
              <Link href="/signup" className="blog-nav-link">
                Sign Up
              </Link>
              <Link href="/admin" className="blog-nav-link blog-nav-link--admin">
                Admin →
              </Link>
            </div>
          </div>
        </nav>

        <div className="blog-hero">
          <h1 className="blog-hero-title">
            Stories &amp;
            <br />
            <em>insights</em>
          </h1>
          <p className="blog-hero-desc">
            Curated thoughts and ideas, written with care and published for curious minds.
          </p>
          <div className="blog-hero-line" />
        </div>

        {posts.length === 0 ? (
          <div className="blog-empty">
            <div className="blog-empty-icon">◇</div>
            <p className="blog-empty-title">Nothing published yet</p>
            <p className="blog-empty-text">Check back soon for new stories.</p>
          </div>
        ) : (
          <>
            <p className="blog-count">
              {posts.length} {posts.length === 1 ? 'story' : 'stories'} published
            </p>

            <div className="blog-grid">
              {posts.map((post: any, i: number) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="blog-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  {(() => {
                    const img = post.featuredImage
                    const src = img?.cloudinary?.secure_url || img?.thumbnailURL || null
                    return src ? (
                      <img className="blog-card-img" src={src} alt={img?.alt || post.title} />
                    ) : (
                      <div className="blog-card-placeholder">✦</div>
                    )
                  })()}

                  <div className="blog-card-body">
                    <span className="blog-card-date">
                      {post.publishedDate ? formatDate(post.publishedDate) : 'Undated'}
                    </span>
                    <h2 className="blog-card-title">{post.title}</h2>
                    {post.author && (
                      <span className="blog-card-author">
                        by{' '}
                        {typeof post.author === 'object' && post.author !== null
                          ? post.author.email === 'deleted@system.local'
                            ? 'Former Author'
                            : post.author.email
                          : 'Unknown'}{' '}
                      </span>
                    )}
                    <span className="blog-card-read">Read story →</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
