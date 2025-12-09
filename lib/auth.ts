import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export interface SessionData {
  userId?: string
  email?: string
  isLoggedIn: boolean
}

const sessionOptions = {
  password: process.env.AUTH0_SECRET || 'complex_password_at_least_32_characters_long_for_session',
  cookieName: 'honestly_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session.isLoggedIn || !session.userId) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: {
        include: {
          photos: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  return user
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.password) {
    return { success: false, error: 'Invalid credentials' }
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    return { success: false, error: 'Invalid credentials' }
  }

  const session = await getSession()
  session.userId = user.id
  session.email = user.email
  session.isLoggedIn = true
  await session.save()

  return { success: true, userId: user.id }
}

export async function signup(email: string, password: string, name?: string) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { success: false, error: 'Email already registered' }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    }
  })

  // Create session
  const session = await getSession()
  session.userId = user.id
  session.email = user.email
  session.isLoggedIn = true
  await session.save()

  return { success: true, userId: user.id }
}

export async function logout() {
  const session = await getSession()
  session.destroy()
}
