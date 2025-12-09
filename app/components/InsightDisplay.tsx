'use client'

import { Letter } from '../page'

interface InsightDisplayProps {
  letter: Letter
  onNewLetter: () => void
}

export default function InsightDisplay({ letter, onNewLetter }: InsightDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Your Letter */}
      <div>
        <h2 className="text-sm text-gray-400 uppercase tracking-wide mb-4">
          Your Letter
        </h2>
        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
          {letter.content}
        </p>
      </div>

      <hr className="border-gray-200" />

      {/* AI Insights */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm text-gray-400 uppercase tracking-wide">
            Response
          </h2>
          <p className="text-xs text-gray-400">
            {new Date(letter.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className="text-foreground whitespace-pre-wrap leading-relaxed">
          {letter.insights}
        </div>
      </div>

      {/* New Letter Button */}
      <div className="flex justify-center pt-8">
        <button
          onClick={onNewLetter}
          className="px-8 py-3 bg-foreground text-white font-medium hover:bg-gray-800 transition-colors"
        >
          Write Another Letter
        </button>
      </div>
    </div>
  )
}
