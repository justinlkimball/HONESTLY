import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeProfile, generateEmbedding } from '@/lib/ai'
import { z } from 'zod'

const profileSchema = z.object({
  bio: z.string().min(50).max(5000),
  age: z.number().min(18).max(100),
  gender: z.string(),
  location: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  preferences: z.object({
    ageMin: z.number().min(18),
    ageMax: z.number().max(100),
    maxDistance: z.number().min(1),
    genderPreference: z.array(z.string()),
    dealbreakers: z.array(z.string()),
  }),
  photoUrls: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = profileSchema.parse(body)

    // Analyze the bio with AI
    console.log('Analyzing profile bio...')
    const analysis = await analyzeProfile(data.bio)

    // Generate embedding
    console.log('Generating embedding...')
    const embeddingText = `${data.bio}\n\nAnalysis: ${JSON.stringify(analysis)}`
    const embedding = await generateEmbedding(embeddingText)

    // Create or update profile
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        bio: data.bio,
        age: data.age,
        gender: data.gender,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        preferences: data.preferences,
        analysis,
        embedding: `[${embedding.join(',')}]`,
        isComplete: true,
      },
      update: {
        bio: data.bio,
        age: data.age,
        gender: data.gender,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        preferences: data.preferences,
        analysis,
        embedding: `[${embedding.join(',')}]`,
        isComplete: true,
      },
    })

    // Handle photos
    if (data.photoUrls && data.photoUrls.length > 0) {
      // Delete existing photos
      await prisma.photo.deleteMany({
        where: { profileId: profile.id },
      })

      // Create new photos
      await prisma.photo.createMany({
        data: data.photoUrls.map((url, index) => ({
          profileId: profile.id,
          url,
          order: index,
        })),
      })
    }

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Profile creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return NextResponse.json({ profile: user.profile })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
