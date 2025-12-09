'use client'

import { useEffect, useState } from 'react'
import AuthForm from './components/AuthForm'
import ProfileForm from './components/ProfileForm'
import MatchesView from './components/MatchesView'

interface User {
  id: string
  email: string
  name?: string
  profile?: {
    isComplete: boolean
    bio: string
    age: number
    gender: string
    location: string
  } | null
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    checkAuth()
  }

  const handleProfileComplete = () => {
    checkAuth()
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  // Not logged in - show auth
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    )
  }

  // Logged in but no profile - show profile creation
  if (!user.profile?.isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
        <ProfileForm onComplete={handleProfileComplete} onLogout={handleLogout} />
      </div>
    )
  }

  // Logged in with complete profile - show matches
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      <MatchesView user={user} onLogout={handleLogout} />
    </div>
  )
}
