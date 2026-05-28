import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { user } = await payload.auth({ headers })

  return (
    <div className="home">
      <div className="content">
        <h1>Welcome to Blog Management System</h1>

        <div className="links">
          {user ? (
            <>
              <a className="admin" href="/admin">
                Go to Dashboard
              </a>
              <a className="docs" href="/signup">
                Signup New User
              </a>
            </>
          ) : (
            <>
              <a className="admin" href="/admin/login">
                Login
              </a>
              <a className="docs" href="/signup">
                Signup
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
