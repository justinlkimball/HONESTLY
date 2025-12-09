import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const matches = await prisma.match.findMany({
      where: {
        userId: user.id,
        status: {
          not: 'PASSED',
        },
      },
      include: {
        matchedUser: {
          include: {
            profile: {
              include: {
                photos: {
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
    })

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('Get matches error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
