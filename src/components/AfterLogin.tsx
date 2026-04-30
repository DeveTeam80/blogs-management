import Link from 'next/link'

export default function AfterLogin() {
  return (
    <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
      <Link href="/forgot-password" style={{ color: 'inherit' }}>
        Forgot your password?
      </Link>
    </p>
  )
}
