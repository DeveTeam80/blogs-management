import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const db = payload.db.drizzle
    const usersTable = payload.db.tables.users

    // Find user by email directly in DB
    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1)

    // Always return success even if user not found (security best practice)
    // This prevents email enumeration attacks
    if (!results[0]) {
      return NextResponse.json({ success: true })
    }

    const user = results[0]

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    // Save token directly to DB
    await db
      .update(usersTable)
      .set({
        resetPasswordToken: resetToken,
        resetPasswordExpiration: resetTokenExpiry,
      })
      .where(eq(usersTable.id, user.id))

    // Send reset email
    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${resetToken}`

    await payload.sendEmail({
      to: user.email, // hardcoded for dev — change to user.email in production
      subject: 'Reset your password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #333;">
          <h2 style="font-size: 24px; margin-bottom: 16px;">Reset your password</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 32px;">
            You requested a password reset. Click the button below to set a new password.
            This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetLink}"
             style="display:inline-block; padding: 14px 28px; background: #111; color: #fff;
                    text-decoration: none; border-radius: 8px; font-size: 14px;">
            Reset Password
          </a>
          <p style="margin-top: 32px; font-size: 12px; color: #aaa;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
