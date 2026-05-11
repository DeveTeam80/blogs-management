import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('id')
  const action = searchParams.get('action')
  const token = searchParams.get('token')

  if (!userId || !action || !token) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })
    const db = payload.db.drizzle
    const usersTable = payload.db.tables.users

    // Fetch user directly from DB — no access control involved
    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(userId)))
      .limit(1)

    const user = results[0]

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.status !== 'pending') {
      return NextResponse.json({ error: `User already ${user.status}` }, { status: 400 })
    }

    if (!user.approvalToken || user.approvalToken !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    if (user.approvalTokenExpiry && new Date(user.approvalTokenExpiry) < new Date()) {
      return NextResponse.json({ error: 'Token expired' }, { status: 403 })
    }

    // Direct DB update — completely bypasses Payload access control
    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    await db
      .update(usersTable)
      .set({
        status: newStatus,
        approvalToken: null,
        approvalTokenExpiry: null,
      })
      .where(eq(usersTable.id, Number(userId)))

    // Send notification email
    try {
      const subject =
        newStatus === 'approved'
          ? 'Your account has been approved!'
          : 'Your account request was declined'

      const html =
        newStatus === 'approved'
          ? `<h2>Welcome!</h2>
             <p>Your account has been approved. You can now log in:</p>
             <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">Log in here</a></p>`
          : `<h2>Account Update</h2>
             <p>Unfortunately, your account request has been declined.</p>`

      await payload.sendEmail({
        to: 'qusairang86@gmail.com', // user.email will work after resend domain verification change EMAIL_USER to noreply@yourdomain.com, and then user.email will work for any recipient.
        subject,
        html,
      })
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }

    return NextResponse.json({
      success: true,
      message: `User ${newStatus} successfully`,
    })
  } catch (error: any) {
    console.error('Approval error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
