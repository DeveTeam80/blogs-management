import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { reassignTo } = await req.json()
    const payload = await getPayload({ config })

    // Get current user from session
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { user } = await payload.auth({
      headers: new Headers({ Authorization: `JWT ${token}` }),
    })

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = user.id

    // ── Step 1: Transfer or null-out posts BEFORE deleting the user ──────────
    // We do this BEFORE deletion so we don't need the afterDelete hook at all.
    // This avoids the context-passing complexity entirely.
    const userPosts = await payload.find({
      collection: 'posts',
      where: { author: { equals: userId } },
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })

    if (userPosts.totalDocs > 0) {
      const transferToId = reassignTo ? Number(reassignTo) : null

      for (const post of userPosts.docs) {
        await payload.update({
          collection: 'posts',
          id: post.id,
          // null = no author (common/uncategorised). Payload allows null on relationship fields.
          data: { author: transferToId } as any,
          overrideAccess: true,
        })
      }
    }

    // ── Step 2: Delete pending UserApprovals for this user ────────────────────
    try {
      const approvals = await payload.find({
        collection: 'user-approvals',
        where: { userId: { equals: userId } },
        limit: 100,
        overrideAccess: true,
      })
      for (const approval of approvals.docs) {
        await payload.delete({
          collection: 'user-approvals',
          id: approval.id,
          overrideAccess: true,
        })
      }
    } catch {
      // user-approvals might not exist — ignore
    }

    // ── Step 3: Delete the user ───────────────────────────────────────────────
    await payload.delete({
      collection: 'users',
      id: userId,
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
