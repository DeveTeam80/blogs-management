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

    // Delete self with reassignTo in context
    await payload.delete({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      context: {
        reassignTo: reassignTo || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
