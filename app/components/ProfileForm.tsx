'use client'

import { useState } from 'react'

interface ProfileFormProps {
  onComplete: () => void
  onLogout: () => void
}

export default function ProfileForm({ onComplete, onLogout }: ProfileFormProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form data
  const [bio, setBio] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [location, setLocation] = useState('')
  const [photoUrls, setPhotoUrls] = useState<string[]>([''])

  // Preferences
  const [ageMin, setAgeMin] = useState('18')
  const [ageMax, setAgeMax] = useState('99')
  const [maxDistance, setMaxDistance] = useState('50')
  const [genderPreference, setGenderPreference] = useState<string[]>(['any'])
  const [dealbreakers, setDealbreakers] = useState<string[]>([])

  const handleSubmit = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          age: parseInt(age),
          gender,
          location,
          photoUrls: photoUrls.filter(url => url.trim()),
          preferences: {
            ageMin: parseInt(ageMin),
            ageMax: parseInt(ageMax),
            maxDistance: parseInt(maxDistance),
            genderPreference,
            dealbreakers,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create profile')
        return
      }

      onComplete()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleGenderPreference = (value: string) => {
    if (value === 'any') {
      setGenderPreference(['any'])
    } else {
      const filtered = genderPreference.filter(g => g !== 'any')
      if (filtered.includes(value)) {
        const newPrefs = filtered.filter(g => g !== value)
        setGenderPreference(newPrefs.length > 0 ? newPrefs : ['any'])
      } else {
        setGenderPreference([...filtered, value])
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-rose-900">Create Your Profile</h1>
        <button
          onClick={onLogout}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Log Out
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-24 h-1 ${
                    step > s ? 'bg-rose-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: About You */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">About You</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write about yourself honestly (minimum 50 characters)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Who are you? What matters to you? What are you looking for? Be authentic - this is how we'll find your best matches."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                minLength={50}
              />
              <p className="text-sm text-gray-500 mt-1">{bio.length} characters</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="18"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!bio || bio.length < 50 || !age || !gender || !location}
              className="w-full py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Photos */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Add Photos</h2>
            <p className="text-gray-600">
              Add photo URLs (for MVP - file upload coming soon)
            </p>

            {photoUrls.map((url, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photo {index + 1} URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...photoUrls]
                    newUrls[index] = e.target.value
                    setPhotoUrls(newUrls)
                  }}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            ))}

            {photoUrls.length < 6 && (
              <button
                onClick={() => setPhotoUrls([...photoUrls, ''])}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                + Add Another Photo
              </button>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Preferences</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interested in
              </label>
              <div className="flex flex-wrap gap-2">
                {['any', 'male', 'female', 'non-binary'].map((pref) => (
                  <button
                    key={pref}
                    onClick={() => toggleGenderPreference(pref)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      genderPreference.includes(pref)
                        ? 'bg-rose-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pref === 'any' ? 'Everyone' : pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Min
                </label>
                <input
                  type="number"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  min="18"
                  max="99"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Max
                </label>
                <input
                  type="number"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  min="18"
                  max="99"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Distance (km)
                </label>
                <input
                  type="number"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                  min="1"
                  max="500"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Profile...' : 'Complete Profile'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
