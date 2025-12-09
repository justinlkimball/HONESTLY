import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { findMatches } from '@/lib/matching'

export async function POST() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!user.profile?.isComplete) {
      return NextResponse.json(
        { error: 'Profile not complete' },
        { status: 400 }
      )
    }

    console.log('Finding matches...')
    const matches = await findMatches(user.id, 10)

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Find matches error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
