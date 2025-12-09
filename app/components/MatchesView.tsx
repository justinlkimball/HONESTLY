'use client'

import { useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name?: string
  profile?: any
}

interface Match {
  id: string
  score: number
  explanation: string
  matchedUser: {
    id: string
    name?: string
    profile: {
      bio: string
      age: number
      gender: string
      location: string
      photos: { url: string }[]
    }
  }
}

interface MatchesViewProps {
  user: User
  onLogout: () => void
}

export default function MatchesView({ user, onLogout }: MatchesViewProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)
  const [findingMatches, setFindingMatches] = useState(false)
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Failed to load matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFindMatches = async () => {
    setFindingMatches(true)
    try {
      const response = await fetch('/api/matches/find', {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
        setCurrentMatchIndex(0)
      }
    } catch (error) {
      console.error('Failed to find matches:', error)
      alert('Failed to find matches. Please try again.')
    } finally {
      setFindingMatches(false)
    }
  }

  const handleLike = async () => {
    if (!currentMatch) return

    try {
      const response = await fetch(`/api/matches/${currentMatch.id}/like`, {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        if (data.mutual) {
          alert("It's a match! 🎉")
        }
        // Move to next match
        if (currentMatchIndex < matches.length - 1) {
          setCurrentMatchIndex(currentMatchIndex + 1)
        } else {
          // No more matches
          setMatches([])
        }
      }
    } catch (error) {
      console.error('Failed to like match:', error)
    }
  }

  const handlePass = async () => {
    if (!currentMatch) return

    try {
      await fetch(`/api/matches/${currentMatch.id}/pass`, {
        method: 'POST',
      })

      // Move to next match
      if (currentMatchIndex < matches.length - 1) {
        setCurrentMatchIndex(currentMatchIndex + 1)
      } else {
        // No more matches
        setMatches([])
      }
    } catch (error) {
      console.error('Failed to pass match:', error)
    }
  }

  const currentMatch = matches[currentMatchIndex]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-rose-900">Honestly</h1>
          <p className="text-gray-600">Welcome back, {user.name || user.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Log Out
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-20">
          <div className="text-xl text-gray-600">Loading matches...</div>
        </div>
      ) : !currentMatch ? (
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {matches.length === 0 ? 'No Matches Yet' : 'No More Matches'}
          </h2>
          <p className="text-gray-600 mb-8">
            {matches.length === 0
              ? "Let's find people who truly get you."
              : "You've seen all your matches! Check back later for more."}
          </p>
          <button
            onClick={handleFindMatches}
            disabled={findingMatches}
            className="px-8 py-4 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
          >
            {findingMatches ? 'Finding Matches...' : 'Find Matches'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Match Card */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Photo */}
            {currentMatch.matchedUser.profile.photos[0] ? (
              <div className="h-96 bg-gray-200 relative">
                <img
                  src={currentMatch.matchedUser.profile.photos[0].url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-rose-600 text-white px-4 py-2 rounded-full font-bold">
                  {currentMatch.score}% Match
                </div>
              </div>
            ) : (
              <div className="h-96 bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center">
                <div className="text-6xl">👤</div>
              </div>
            )}

            {/* Info */}
            <div className="p-6">
              <div className="flex items-baseline gap-4 mb-4">
                <h2 className="text-3xl font-bold text-gray-800">
                  {currentMatch.matchedUser.name || 'Anonymous'}
                </h2>
                <span className="text-xl text-gray-600">
                  {currentMatch.matchedUser.profile.age}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">
                  {currentMatch.matchedUser.profile.location}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-2">About</h3>
                <p className="text-gray-700 leading-relaxed">
                  {currentMatch.matchedUser.profile.bio}
                </p>
              </div>

              {/* Compatibility Explanation */}
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-6 h-6 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <h3 className="font-bold text-rose-900 text-lg">
                    Why you might click
                  </h3>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {currentMatch.explanation}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handlePass}
              className="w-20 h-20 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400 transition-colors shadow-lg"
              title="Pass"
            >
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={handleLike}
              className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center hover:bg-rose-700 transition-colors shadow-lg"
              title="Like"
            >
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Match Counter */}
          <div className="text-center text-gray-600">
            {currentMatchIndex + 1} of {matches.length}
          </div>
        </div>
      )}
    </div>
  )
}
