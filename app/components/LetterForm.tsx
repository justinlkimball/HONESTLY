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
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your letter here..."
          className="w-full h-96 p-4 border border-gray-200 focus:outline-none focus:border-gray-400 resize-none text-foreground leading-relaxed bg-white"
          disabled={isAnalyzing}
        />

        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            {content.length} characters
          </p>

          <button
            type="submit"
            disabled={!content.trim() || isAnalyzing}
            className="px-8 py-3 bg-foreground text-white font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              'Send Letter'
            )}
          </button>
        </div>
      </form>

      <p className="mt-4 text-xs text-gray-400 text-center">
        Your letters are stored locally in your browser.
      </p>
    </div>
  )
}
