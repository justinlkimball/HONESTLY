import { prisma } from './prisma'
import { generateCompatibilityExplanation } from './ai'

interface UserPreferences {
  ageMin: number
  ageMax: number
  maxDistance: number // in km
  genderPreference: string[] // ['male', 'female', 'non-binary', 'any']
  dealbreakers: string[]
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

function parseEmbedding(embedding: unknown): number[] {
  // pgvector stores embeddings as a string like "[0.1,0.2,...]"
  if (typeof embedding === 'string') {
    const parsed = embedding.replace(/[\[\]]/g, '').split(',').map(parseFloat)
    return parsed
  }
  return embedding as number[]
}

export async function findMatches(userId: string, limit: number = 10) {
  // Get current user's profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          photos: true,
        },
      },
    },
  })

  if (!user?.profile || !user.profile.embedding) {
    throw new Error('User profile not complete')
  }

  const userProfile = user.profile
  const userPrefs = userProfile.preferences as UserPreferences
  const userEmbedding = parseEmbedding(userProfile.embedding)
  const userAnalysis = userProfile.analysis

  // Get all potential matches (active, complete profiles, not already matched)
  const existingMatches = await prisma.match.findMany({
    where: {
      OR: [
        { userId },
        { matchedUserId: userId }
      ]
    },
    select: {
      userId: true,
      matchedUserId: true,
    }
  })

  const matchedUserIds = new Set(
    existingMatches.flatMap(m => [m.userId, m.matchedUserId])
  )
  matchedUserIds.add(userId) // Exclude self

  const potentialMatches = await prisma.profile.findMany({
    where: {
      userId: {
        notIn: Array.from(matchedUserIds),
      },
      isComplete: true,
      isActive: true,
      embedding: {
        not: null,
      },
    },
    include: {
      user: true,
      photos: {
        orderBy: { order: 'asc' },
        take: 1,
      },
    },
  })

  // Score and filter matches
  const scoredMatches = potentialMatches
    .map(profile => {
      const prefs = profile.preferences as UserPreferences

      // Rule-based filtering
      // Age check
      if (
        profile.age < userPrefs.ageMin ||
        profile.age > userPrefs.ageMax ||
        userProfile.age < prefs.ageMin ||
        userProfile.age > prefs.ageMax
      ) {
        return null
      }

      // Gender check
      if (
        !userPrefs.genderPreference.includes('any') &&
        !userPrefs.genderPreference.includes(profile.gender)
      ) {
        return null
      }
      if (
        !prefs.genderPreference.includes('any') &&
        !prefs.genderPreference.includes(userProfile.gender)
      ) {
        return null
      }

      // Distance check
      if (
        userProfile.latitude &&
        userProfile.longitude &&
        profile.latitude &&
        profile.longitude
      ) {
        const distance = calculateDistance(
          userProfile.latitude,
          userProfile.longitude,
          profile.latitude,
          profile.longitude
        )

        if (distance > userPrefs.maxDistance || distance > prefs.maxDistance) {
          return null
        }
      }

      // Embedding similarity score
      const profileEmbedding = parseEmbedding(profile.embedding!)
      const similarity = cosineSimilarity(userEmbedding, profileEmbedding)

      // Convert similarity (-1 to 1) to score (0 to 100)
      const score = Math.round(((similarity + 1) / 2) * 100)

      return {
        profile,
        score,
        similarity,
      }
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  // Generate matches with explanations
  const matches = await Promise.all(
    scoredMatches.map(async ({ profile, score }) => {
      const explanation = await generateCompatibilityExplanation(
        userAnalysis as any,
        profile.analysis as any,
        score
      )

      const match = await prisma.match.create({
        data: {
          userId,
          matchedUserId: profile.userId,
          score,
          explanation,
          status: 'PENDING',
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
      })

      return match
    })
  )

  return matches
}

export async function likeMatch(userId: string, matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      user: true,
      matchedUser: true,
    },
  })

  if (!match) {
    throw new Error('Match not found')
  }

  // Determine which user is liking
  const isInitiator = match.userId === userId

  const updateData = isInitiator
    ? { userLiked: true, status: 'LIKED' as const }
    : { matchedUserLiked: true }

  // Update the match
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: updateData,
  })

  // Check if it's mutual
  if (updatedMatch.userLiked && updatedMatch.matchedUserLiked) {
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'MUTUAL' },
    })
    return { mutual: true, match: updatedMatch }
  }

  return { mutual: false, match: updatedMatch }
}

export async function passMatch(userId: string, matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  })

  if (!match) {
    throw new Error('Match not found')
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { status: 'PASSED' },
  })
}
