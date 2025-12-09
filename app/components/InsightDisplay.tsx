'use client'

import { Letter } from '../page'

interface InsightDisplayProps {
  letter: Letter
  onNewLetter: () => void
}

export default function InsightDisplay({ letter, onNewLetter }: InsightDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Your Letter */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-amber-900 mb-4">
          Your Letter
        </h2>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {letter.content}
          </p>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl shadow-xl p-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-amber-900">
              Reflections from Your Friend
            </h2>
            <p className="text-amber-700 text-sm mt-1">
              {new Date(letter.timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {letter.insights}
          </div>
        </div>
      </div>

      {/* New Letter Button */}
      <div className="flex justify-center">
        <button
          onClick={onNewLetter}
          className="px-8 py-3 bg-white text-amber-700 rounded-lg font-medium hover:bg-amber-50 transition-colors shadow-lg border-2 border-amber-200"
        >
          Write Another Letter
        </button>
      </div>
    </div>
  )
}
