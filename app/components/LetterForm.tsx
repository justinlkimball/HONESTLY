'use client'

import { useState } from 'react'

interface LetterFormProps {
  onSubmit: (content: string) => void
  isAnalyzing: boolean
}

export default function LetterForm({ onSubmit, isAnalyzing }: LetterFormProps) {
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-semibold text-amber-900 mb-6">
        Dear Friend,
      </h2>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your letter here... Share what's on your mind, your feelings, your experiences. This is a safe space."
          className="w-full h-96 p-4 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none text-gray-700 leading-relaxed"
          disabled={isAnalyzing}
        />

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {content.length} characters
          </p>

          <button
            type="submit"
            disabled={!content.trim() || isAnalyzing}
            className="px-8 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reflecting...
              </span>
            ) : (
              'Send Letter'
            )}
          </button>
        </div>
      </form>

      <p className="mt-4 text-xs text-gray-400 text-center">
        Your letters are stored locally in your browser and processed with care.
      </p>
    </div>
  )
}
