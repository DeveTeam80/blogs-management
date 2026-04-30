import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if email already exists
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      overrideAccess: true,
    })

    if (existing.totalDocs > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 },
      )
    }

    await payload.create({
      collection: 'users',
      data: { email, password, name },
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Account created. Please wait for admin approval.',
    })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
