import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Link from 'next/link'

async function getPost(slug: string) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
  })

  return result.docs[0] || null
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function lexicalToHtml(node: any): string {
  if (!node) return ''

  if (node.type === 'text') {
    let text = node.text || ''
    if (node.format & 1) text = `<strong>${text}</strong>`
    if (node.format & 2) text = `<em>${text}</em>`
    if (node.format & 4) text = `<s>${text}</s>`
    if (node.format & 8) text = `<u>${text}</u>`
    if (node.format & 16) text = `<code>${text}</code>`
    return text
  }

  if (node.type === 'linebreak') return '<br />'

  const children = (node.children || []).map(lexicalToHtml).join('')

  switch (node.type) {
    case 'root':
      return children

    case 'paragraph':
      if (!children.trim()) return '<p><br /></p>'
      return `<p>${children}</p>`

    case 'heading':
      const tag = node.tag || 'h2'
      return `<${tag}>${children}</${tag}>`

    case 'list':
      const listTag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${listTag}>${children}</${listTag}>`

    case 'listitem':
      return `<li>${children}</li>`

    case 'quote':
      return `<blockquote>${children}</blockquote>`

    case 'link':
    case 'autolink':
      const href = node.fields?.url || node.url || '#'
      const target = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${target}>${children}</a>`

    case 'upload':
      const imgUrl = node.value?.url || ''
      const alt = node.value?.alt || ''
      if (imgUrl) return `<img src="${imgUrl}" alt="${alt}" />`
      return ''

    default:
      return children || ''
  }
}

function renderContent(content: any): string {
  if (!content) return ''
  if (typeof content === 'string') return content

  if (content.root) {
    return lexicalToHtml(content.root)
  }

  return ''
}

function getAuthorName(author: any) {
  if (!author) return 'Unknown Author'
  if (typeof author === 'object') {
    if (author.email === 'deleted@system.local') return 'Former Author'
    return author.name || author.email || 'Unknown Author'
  }
  return 'Unknown Author'
}

function getAuthorEmail(author: any) {
  if (!author) return ''
  if (typeof author === 'object') {
    if (author.email === 'deleted@system.local') return ''
    return author.email || ''
  }
  return ''
}
export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  const contentHtml = renderContent(post.content)
  const authorName = getAuthorName(post.author)
  const authorEmail = getAuthorEmail(post.author)
  // const readingTime = post.readingTime || 3

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${post.slug}`

  return (
    <>
      <>
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap');

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
      }

      .blog-page {
        min-height: 100vh;
        background: #f6f3ee;
        color: #171717;
        font-family: 'Inter', sans-serif;
      }

      .blog-topbar {
        height: 68px;
        border-bottom: 1px solid rgba(0,0,0,0.08);
        background: rgba(246,243,238,0.9);
        backdrop-filter: blur(14px);
        position: sticky;
        top: 0;
        z-index: 50;
      }

      .blog-topbar-inner {
        max-width: 1180px;
        margin: 0 auto;
        height: 100%;
        padding: 0 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .blog-logo {
        text-decoration: none;
        color: #111;
        font-weight: 800;
        font-size: 18px;
        letter-spacing: -0.04em;
      }

      .blog-nav-actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .blog-nav-link {
        text-decoration: none;
        color: #555;
        font-size: 13px;
        font-weight: 600;
        border: 1px solid rgba(0,0,0,0.1);
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.45);
      }

      .blog-nav-link:hover {
        background: #111;
        color: #fff;
      }

      .hero {
        max-width: 1180px;
        margin: 0 auto;
        padding: 42px 24px 0;
      }

      .hero-card {
        position: relative;
        overflow: hidden;
        border-radius: 34px;
        min-height: 560px;
        background:
          linear-gradient(135deg, rgba(0,0,0,0.78), rgba(0,0,0,0.25)),
          #161616;
        display: flex;
        align-items: flex-end;
        box-shadow: 0 30px 80px rgba(0,0,0,0.14);
      }

      .hero-card.has-image {
        background:
          linear-gradient(135deg, rgba(0,0,0,0.78), rgba(0,0,0,0.22)),
          var(--hero-image);
        background-size: cover;
        background-position: center;
      }

      .hero-content {
        position: relative;
        z-index: 2;
        max-width: 850px;
        padding: 54px;
        color: #fff;
      }

      .hero-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin-bottom: 18px;
      }

      .hero-pill {
        font-size: 12px;
        font-weight: 700;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.16);
        border: 1px solid rgba(255,255,255,0.22);
        color: #fff;
      }

      .hero-title {
        font-family: 'Playfair Display', serif;
        font-size: clamp(42px, 7vw, 82px);
        line-height: 0.96;
        letter-spacing: -0.045em;
        margin: 0;
      }

      .hero-excerpt {
        max-width: 720px;
        margin-top: 22px;
        font-size: 18px;
        line-height: 1.7;
        color: rgba(255,255,255,0.82);
      }

      .author-strip {
        max-width: 1080px;
        margin: -42px auto 0;
        padding: 0 38px;
        position: relative;
        z-index: 5;
      }

      .author-strip-card {
        background: #fff;
        border-radius: 24px;
        padding: 22px;
        box-shadow: 0 18px 50px rgba(0,0,0,0.08);
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 22px;
        align-items: center;
        border: 1px solid rgba(0,0,0,0.06);
      }

      .author-info {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .author-avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #111;
        color: #fff;
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 18px;
        text-transform: uppercase;
      }

      .author-name {
        font-weight: 800;
        color: #111;
        margin-bottom: 4px;
      }

      .author-sub {
        color: #777;
        font-size: 13px;
      }

      .author-stats {
        display: flex;
        gap: 14px;
      }

      .stat-box {
        min-width: 100px;
        padding: 12px 16px;
        border-radius: 16px;
        background: #f6f3ee;
        text-align: center;
      }

      .stat-box strong {
        display: block;
        font-size: 18px;
        color: #111;
      }

      .stat-box span {
        font-size: 12px;
        color: #777;
        font-weight: 600;
      }

      .main-wrap {
        max-width: 1180px;
        margin: 54px auto 0;
        padding: 0 24px 90px;
        display: grid;
        grid-template-columns: 180px minmax(0, 760px) 240px;
        gap: 34px;
        align-items: start;
      }

      .left-tools,
      .right-tools {
        position: sticky;
        top: 96px;
      }

      .side-card {
        background: #fff;
        border-radius: 22px;
        border: 1px solid rgba(0,0,0,0.07);
        padding: 18px;
        box-shadow: 0 12px 35px rgba(0,0,0,0.035);
      }

      .side-title {
        font-size: 11px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #999;
        font-weight: 800;
        margin-bottom: 12px;
      }

      .share-list {
        display: grid;
        gap: 10px;
      }

      .share-btn {
        text-decoration: none;
        color: #111;
        font-size: 13px;
        font-weight: 700;
        border: 1px solid rgba(0,0,0,0.08);
        border-radius: 14px;
        padding: 11px 12px;
        background: #fafafa;
        text-align: center;
      }

      .share-btn:hover {
        background: #111;
        color: #fff;
      }

      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .tag {
        font-size: 12px;
        font-weight: 700;
        color: #7a5b35;
        background: #f4eadb;
        padding: 7px 10px;
        border-radius: 999px;
      }

    
      .article-body {
        font-family: 'Inter', sans-serif;
        font-size: 16px;
        line-height: 1.9;
        color: #3f3f3f;
      }

      .article-body > *:first-child {
        margin-top: 0;
      }

      .article-body p {
        margin: 0 0 24px;
      }

      .article-body h1,
      .article-body h2,
      .article-body h3 {
        color: #111;
        line-height: 1.18;
        letter-spacing: -0.04em;
        margin: 46px 0 16px;
      }

      .article-body h1 {
        font-size: 25px;
      }

      .article-body h2 {
        font-size: 20px;
      }

      .article-body h3 {
        font-size: 18px;
      }

      .article-body blockquote {
        margin: 34px 0;
        padding: 26px 28px;
        border-radius: 20px;
        background: #f6f3ee;
        border-left: 5px solid #111;
        color: #555;
        font-size: 21px;
        line-height: 1.65;
        font-family: 'Playfair Display', serif;
      }

      .article-body ul,
      .article-body ol {
        padding-left: 28px;
        margin-bottom: 24px;
      }

      .article-body li {
        margin-bottom: 10px;
      }

      .article-body a {
        color: #7a5b35;
        font-weight: 700;
        text-decoration-thickness: 2px;
        text-underline-offset: 4px;
      }

      .article-body img {
        width: 100%;
        border-radius: 20px;
        margin: 34px 0;
      }

      .article-body code {
        background: #f2eee8;
        padding: 3px 7px;
        border-radius: 6px;
        font-size: 14px;
      }

      .article-body pre {
        background: #111;
        color: #f5f5f5;
        padding: 24px;
        border-radius: 18px;
        overflow-x: auto;
        margin: 34px 0;
      }

      .newsletter-card {
        background: #111;
        color: #fff;
        border-radius: 22px;
        padding: 22px;
      }

      .newsletter-card h3 {
        font-size: 20px;
        line-height: 1.2;
        margin-bottom: 10px;
      }

      .newsletter-card p {
        color: #c8c8c8;
        line-height: 1.55;
        font-size: 14px;
        margin-bottom: 18px;
      }

      .newsletter-card a {
        display: block;
        text-align: center;
        background: #fff;
        color: #111;
        text-decoration: none;
        font-weight: 800;
        padding: 12px 14px;
        border-radius: 999px;
      }

      .related-box {
        margin-top: 18px;
      }

      .related-link {
        display: block;
        color: #111;
        text-decoration: none;
        font-weight: 700;
        line-height: 1.45;
        padding: 12px 0;
        border-top: 1px solid rgba(0,0,0,0.08);
      }

      .footer-nav {
        max-width: 1180px;
        margin: 0 auto;
        padding: 0 24px 70px;
      }

      .footer-nav-inner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(0,0,0,0.1);
        padding-top: 28px;
      }

      .footer-link {
        text-decoration: none;
        color: #555;
        font-weight: 700;
        font-size: 14px;
      }

      .footer-edit {
        text-decoration: none;
        color: #fff;
        background: #111;
        padding: 11px 18px;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 800;
      }

      .empty-content {
        color: #999;
        font-style: italic;
      }

      @media (max-width: 1050px) {
        .main-wrap {
          grid-template-columns: 1fr;
        }

        .left-tools,
        .right-tools {
          position: static;
        }

        .left-tools {
          order: 2;
        }

        .right-tools {
          order: 3;
        }

        .author-strip-card {
          grid-template-columns: 1fr;
        }

        .author-stats {
          width: 100%;
        }

        .stat-box {
          flex: 1;
        }
      }

      @media (max-width: 640px) {
        .hero {
          padding: 24px 14px 0;
        }

        .hero-card {
          min-height: 520px;
          border-radius: 24px;
        }

        .hero-content {
          padding: 32px 24px;
        }

        .hero-title {
          font-size: 42px;
        }

        .hero-excerpt {
          font-size: 16px;
        }

        .author-strip {
          padding: 0 22px;
        }

        .main-wrap {
          padding-left: 14px;
          padding-right: 14px;
          margin-top: 34px;
        }

        .article-card {
          border-radius: 22px;
          padding: 26px 20px;
        }

        .article-body {
          font-size: 12px;
        }

        .blog-nav-actions {
          display: none;
        }

        .footer-nav-inner {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
      }
    `}</style>

        <div className="blog-page">
          <nav className="blog-topbar">
            <div className="blog-topbar-inner">
              <Link href="/blog" className="blog-logo">
                Stories
              </Link>

              <div className="blog-nav-actions">
                <Link href="/blog" className="blog-nav-link">
                  All Posts
                </Link>
              </div>
            </div>
          </nav>

          <section className="hero">
            <div
              className={`hero-card ${typeof post.featuredImage !== 'number' && post.featuredImage?.url ? 'has-image' : ''}`}
              style={
                typeof post.featuredImage !== 'number' && post.featuredImage?.url
                  ? ({
                      '--hero-image': `url(${post.featuredImage.url})`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <div className="hero-content">
                <div className="hero-meta">
                  {post.category && <span className="hero-pill">{post.category}</span>}

                  {post.publishedDate && (
                    <span className="hero-pill">{formatDate(post.publishedDate)}</span>
                  )}

                  {/* <span className="hero-pill">{readingTime} min read</span> */}
                </div>

                <h1 className="hero-title">{post.title}</h1>

                {post.excerpt && <p className="hero-excerpt">{post.excerpt}</p>}
              </div>
            </div>
          </section>

          <section className="author-strip">
            <div className="author-strip-card">
              <div className="author-info">
                <div className="author-avatar">{authorName.charAt(0)}</div>
                <div>
                  <div className="author-name">{authorName}</div>
                  <div className="author-sub">
                    {authorEmail || 'Author'} ·{' '}
                    {post.publishedDate ? formatDate(post.publishedDate) : 'Unpublished'}
                  </div>
                </div>
              </div>

              <div className="author-stats">
                {/* <div className="stat-box">
                  <strong>{readingTime}</strong>
                  <span>Min Read</span>
                </div> */}

                {/* <div className="stat-box">
                  <strong>{post.status === 'published' ? 'Live' : 'Draft'}</strong>
                  <span>Status</span>
                </div> */}
              </div>
            </div>
          </section>

          <main className="main-wrap">
            <aside className="left-tools">
              <div className="side-card">
                <div className="side-title">Share</div>

                <div className="share-list">
                  <a
                    className="share-btn"
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      shareUrl,
                    )}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Twitter
                  </a>

                  <a
                    className="share-btn"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      shareUrl,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>

                  <a className="share-btn" href={`mailto:?subject=${post.title}&body=${shareUrl}`}>
                    Email
                  </a>
                </div>
              </div>
            </aside>

            <article className="article-card">
              {contentHtml ? (
                <div className="article-body" dangerouslySetInnerHTML={{ __html: contentHtml }} />
              ) : (
                <p className="empty-content">No content yet.</p>
              )}
            </article>

            {/* <aside className="right-tools">
              <div className="newsletter-card related-box">
                <h3>Get new stories</h3>
                <p>Subscribe and receive the latest articles directly in your inbox.</p>
                <Link href="/subscribe">Subscribe</Link>
              </div>
            </aside> */}
          </main>

          <footer className="footer-nav">
            <div className="footer-nav-inner">
              <Link href="/blog" className="footer-link">
                ← Back to all stories
              </Link>
            </div>
          </footer>
        </div>
      </>
    </>
  )
}
