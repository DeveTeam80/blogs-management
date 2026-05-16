import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const cookieStore = await cookies()
    const token = cookieStore.get('payload-token')?.value

    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { user } = await payload.auth({
      headers: new Headers({ Authorization: `JWT ${token}` }),
    })

    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const result = await payload.find({
      collection: 'users',
      where: {
        and: [{ status: { equals: 'approved' } }, { id: { not_equals: user.id } }],
      },
      limit: 200,
      depth: 0,
      overrideAccess: true,
    })

    // Only return id, name, email — no role shown in dropdown
    const users = result.docs.map((u: any) => ({
      id: u.id,
      name: u.name || null,
      email: u.email,
    }))

    return NextResponse.json({ users })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
