'use client'

import { useState } from 'react'
import LetterForm from './components/LetterForm'
import InsightDisplay from './components/InsightDisplay'
import LetterHistory from './components/LetterHistory'

export interface Letter {
  id: string
  content: string
  insights: string
  timestamp: number
}

export default function Home() {
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [letters, setLetters] = useState<Letter[]>([])

  const handleLetterSubmit = async (content: string) => {
    setIsAnalyzing(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze letter')
      }

      const data = await response.json()

      const newLetter: Letter = {
        id: Date.now().toString(),
        content,
        insights: data.insights,
        timestamp: Date.now(),
      }

      setCurrentLetter(newLetter)

      // Save to local storage
      const savedLetters = localStorage.getItem('honestly-letters')
      const existingLetters: Letter[] = savedLetters ? JSON.parse(savedLetters) : []
      const updatedLetters = [newLetter, ...existingLetters]
      localStorage.setItem('honestly-letters', JSON.stringify(updatedLetters))
      setLetters(updatedLetters)

    } catch (error) {
      console.error('Error analyzing letter:', error)
      alert('Sorry, there was an error analyzing your letter. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleLoadLetter = (letter: Letter) => {
    setCurrentLetter(letter)
  }

  const handleNewLetter = () => {
    setCurrentLetter(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-amber-900 mb-4">
            Honestly
          </h1>
          <p className="text-xl text-amber-700 max-w-2xl mx-auto">
            Write a letter to your AI friend. Share your thoughts, feelings, and experiences.
            Receive thoughtful insights that help you understand yourself better.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {!currentLetter ? (
              <LetterForm onSubmit={handleLetterSubmit} isAnalyzing={isAnalyzing} />
            ) : (
              <InsightDisplay letter={currentLetter} onNewLetter={handleNewLetter} />
            )}
          </div>

          {/* Sidebar - Letter History */}
          <div className="lg:col-span-1">
            <LetterHistory
              letters={letters}
              onLoadLetter={handleLoadLetter}
              currentLetterId={currentLetter?.id}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
