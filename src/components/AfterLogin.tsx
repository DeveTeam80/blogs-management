import Link from 'next/link'

export default function AfterLogin() {
  return (
    <>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
        <Link href="/forgot-password" style={{ color: 'inherit' }}>
          Forgot your password?
        </Link>
      </p>

      <div
        style={{
          textAlign: 'center',
          marginBottom: '8px',
          fontSize: '13px',
          color: '#888',
        }}
      >
        New user?{' '}
        <Link
          href="/signup"
          style={{
            color: '#1a1a1a',
            fontWeight: '600',
            textDecoration: 'none',
            borderBottom: '1px solid #1a1a1a',
          }}
        >
          Sign up
        </Link>
      </div>
    </>
  )
}
