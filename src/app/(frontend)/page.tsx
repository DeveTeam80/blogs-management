import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { user } = await payload.auth({ headers })

  // If user is already logged in, directly redirect to Payload admin
  if (user) {
    redirect(payloadConfig.routes.admin)
  }

  return (
    <div className="home">
      <div className="content">
        <h1>Welcome to Blog Management System</h1>

        <div className="links">
          <a
            className="docs"
            href={`${process.env.NEXT_PUBLIC_SITE_URL}/signup`}
            rel="noopener noreferrer"
          >
            Signup
          </a>
        </div>
      </div>
    </div>
  )
}
