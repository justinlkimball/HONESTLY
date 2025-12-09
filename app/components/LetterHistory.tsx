'use client'

import { useEffect, useState } from 'react'
import { Letter } from '../page'

interface LetterHistoryProps {
  letters: Letter[]
  onLoadLetter: (letter: Letter) => void
  currentLetterId?: string
}

export default function LetterHistory({ letters, onLoadLetter, currentLetterId }: LetterHistoryProps) {
  const [localLetters, setLocalLetters] = useState<Letter[]>([])

  useEffect(() => {
    // Load letters from local storage on mount
    const savedLetters = localStorage.getItem('honestly-letters')
    if (savedLetters) {
      setLocalLetters(JSON.parse(savedLetters))
    }
  }, [])

  // Use the letters from props if available, otherwise use local letters
  const displayLetters = letters.length > 0 ? letters : localLetters

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
      <h2 className="text-xl font-semibold text-amber-900 mb-4">
        Your Letters
      </h2>

      {displayLetters.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          No letters yet. Write your first letter to begin your journey of self-discovery.
        </p>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {displayLetters.map((letter) => (
            <button
              key={letter.id}
              onClick={() => onLoadLetter(letter)}
              className={`w-full text-left p-4 rounded-lg transition-colors ${
                currentLetterId === letter.id
                  ? 'bg-amber-100 border-2 border-amber-400'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">
                {new Date(letter.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="text-sm text-gray-700 line-clamp-3">
                {letter.content}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
