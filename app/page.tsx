'use client'

import { useState } from 'react'
import LetterForm from './components/LetterForm'
import InsightDisplay from './components/InsightDisplay'

export interface Letter {
  id: string
  content: string
  insights: string
  timestamp: number
}

export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

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

    } catch (error) {
      console.error('Error analyzing letter:', error)
      alert('Sorry, there was an error analyzing your letter. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleNewLetter = () => {
    setCurrentLetter(null)
  }

  const handleBackToHome = () => {
    setShowLanding(true)
    setCurrentLetter(null)
  }

  // Landing page
  if (showLanding) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-serif italic text-7xl md:text-8xl text-foreground mb-2">
            Honestly
          </h1>
          <p className="font-serif italic text-gray-400 text-lg mb-16">
            ...it just works.
          </p>
          <p className="text-foreground text-xl mb-12">
            Write Letter → Right Person
          </p>
          <button
            onClick={() => setShowLanding(false)}
            className="bg-foreground text-white px-10 py-4 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            Write yours
          </button>
        </div>
      </main>
    )
  }

  // Letter writing / insights view
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <button
            onClick={handleBackToHome}
            className="mb-8 text-gray-400 hover:text-foreground transition-colors"
          >
            ← Back
          </button>
          <h1 className="font-serif italic text-5xl text-foreground mb-2">
            Honestly
          </h1>
          <p className="font-serif italic text-gray-400 text-sm">
            ...it just works.
          </p>
        </div>

        {/* Main Content */}
        <div>
          {!currentLetter ? (
            <LetterForm onSubmit={handleLetterSubmit} isAnalyzing={isAnalyzing} />
          ) : (
            <InsightDisplay letter={currentLetter} onNewLetter={handleNewLetter} />
          )}
        </div>
      </div>
    </main>
  )
}
