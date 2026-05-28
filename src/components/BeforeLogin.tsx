export default function BeforeLogin() {
  return (
    <>
      <style>{`
        a[href="/admin/forgot"] {
          display: none !important;
        }

        /* Hide document ID badge */
        .id-label {
          display: none !important;
        }

        /* Hide theme/appearance toggle everywhere */
        [class*="theme"],
        [class*="Theme"],
        [id*="theme"],
        [id*="Theme"],
        [class*="appearance"],
        [class*="Appearance"],
        label[for*="theme"],
        .nav__theme,
        .theme-selector,
        .payload__theme-selector {
          display: none !important;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: '13px',
          color: '#888',
        }}
      >
        <span>
          New user?{' '}
          <a
            href="/signup"
            style={{
              color: '#1a1a1a',
              fontWeight: '600',
              textDecoration: 'none',
              borderBottom: '1px solid #1a1a1a',
            }}
          >
            Sign up
          </a>
        </span>
        <a href="/admin/forgot" style={{ color: '#888', textDecoration: 'none' }}>
          Forgot password?
        </a>
      </div>
    </>
  )
}
