import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const db = payload.db.drizzle
    const usersTable = payload.db.tables.users

    // Find user by reset token
    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.resetPasswordToken, token))
      .limit(1)

    if (!results[0]) {
      return NextResponse.json({ error: 'Invalid or expired reset link' }, { status: 400 })
    }

    const user = results[0]

    // Check token expiry
    if (user.resetPasswordExpiration && new Date(user.resetPasswordExpiration) < new Date()) {
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 },
      )
    }

    // Use Payload's built-in resetPassword which handles hashing correctly
    await payload.resetPassword({
      collection: 'users',
      data: {
        token,
        password,
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
