import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

function htmlResponse(title: string, message: string, isError = false) {
  const color = isError ? '#dc2626' : '#16a34a'
  const icon = isError ? '✗' : '✓'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f4f6f8;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      padding: 40px 36px;
      max-width: 420px;
      width: 90%;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.10);
    }
    .icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: ${color}18;
      color: ${color};
      font-size: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      border: 2px solid ${color}30;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 10px;
    }
    p {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-block;
      padding: 10px 28px;
      background: #111827;
      color: #fff;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      border: none;
    }
    .countdown {
      margin-top: 14px;
      font-size: 12px;
      color: #9ca3af;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h2>${title}</h2>
    <p>${message}</p>
    <button class="btn" onclick="window.close()">Close this tab</button>
    <p class="countdown" id="countdown">This tab will close automatically in <span id="sec">5</span>s</p>
  </div>
  <script>
    let s = 5;
    const el = document.getElementById('sec');
    const interval = setInterval(() => {
      s--;
      if (el) el.textContent = s;
      if (s <= 0) {
        clearInterval(interval);
        window.close();
        // If window.close() is blocked, redirect to admin
        setTimeout(() => { window.location.href = '/admin'; }, 300);
      }
    }, 1000);
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('id')
  const action = searchParams.get('action')
  const token = searchParams.get('token')

  if (!userId || !action || !token) {
    return htmlResponse(
      'Missing Parameters',
      'Required parameters are missing from the link.',
      true,
    )
  }

  if (action !== 'approve' && action !== 'reject') {
    return htmlResponse('Invalid Action', 'The action in this link is not valid.', true)
  }

  try {
    const payload = await getPayload({ config })
    const db = payload.db.drizzle
    const usersTable = payload.db.tables.users

    const results = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(userId)))
      .limit(1)

    const user = results[0]

    if (!user) {
      return htmlResponse('User Not Found', 'This user no longer exists in the system.', true)
    }

    if (user.status !== 'pending') {
      return htmlResponse(
        'Already Processed',
        `This user has already been ${user.status}. No changes were made.`,
        true,
      )
    }

    if (!user.approvalToken || user.approvalToken !== token) {
      return htmlResponse('Invalid Link', 'This approval link is not valid.', true)
    }

    if (user.approvalTokenExpiry && new Date(user.approvalTokenExpiry) < new Date()) {
      return htmlResponse(
        'Link Expired',
        'This approval link has expired. Please contact the user to re-register.',
        true,
      )
    }

    // ── Reject ────────────────────────────────────────────────
    if (action === 'reject') {
      await payload.delete({
        collection: 'users',
        id: Number(userId),
        overrideAccess: true,
      })

      return htmlResponse(
        'User Rejected',
        `The account for <strong>${user.email}</strong> has been rejected and removed from the system.`,
      )
    }

    // ── Approve ───────────────────────────────────────────────
    await db
      .update(usersTable)
      .set({
        status: 'approved',
        approvalToken: null,
        approvalTokenExpiry: null,
      })
      .where(eq(usersTable.id, Number(userId)))

    try {
      await payload.sendEmail({
        to: user.email,
        subject: 'Your account has been approved!',
        html: `
          <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:24px;">
            <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
              <div style="background:#16a34a;padding:20px;text-align:center;">
                <h2 style="margin:0;color:#fff;">Account Approved ✓</h2>
              </div>
              <div style="padding:24px;color:#333;">
                <p>Hello,</p>
                <p>Your account has been approved. You can now log in:</p>
                <div style="text-align:center;margin-top:24px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/login"
                     style="display:inline-block;padding:12px 24px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">
                    Login to Your Account
                  </a>
                </div>
              </div>
            </div>
          </div>
        `,
      })
    } catch (emailErr) {
      console.error('Email send failed:', emailErr)
    }

    return htmlResponse(
      'User Approved',
      `The account for <strong>${user.email}</strong> has been approved successfully. A confirmation email has been sent to them.`,
    )
  } catch (error: any) {
    console.error('Approval error:', error)
    return htmlResponse(
      'Something Went Wrong',
      error.message || 'An unexpected error occurred.',
      true,
    )
  }
}
