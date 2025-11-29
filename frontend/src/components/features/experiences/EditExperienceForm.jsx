"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FiSave, FiX, FiCalendar, FiTag, FiMapPin, FiSmile, FiLock, FiGlobe,
  FiAlertCircle, FiChevronDown, FiArrowLeft, FiClock
} from 'react-icons/fi'
import { CATEGORIES, MOODS } from '@/lib/constants'
import { apiClient } from '@/lib/api-client'
import { PuzzleLoader, useToast } from '@/components/common'
import { useDropdown } from '@/hooks'

export default function EditExperienceForm({ experience }) {
  const router = useRouter()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Use custom dropdown hooks
  const categoryDropdown = useDropdown()
  const moodDropdown = useDropdown()
  
  // Extract date and time directly from ISO string
  // experience.date format: "2025-11-28T17:16:00.000Z"
  const originalDate = experience.date // Store original date to compare
  const dateOnly = experience.date.split('T')[0] // Get YYYY-MM-DD directly from ISO string
  const timeOnly = experience.date.split('T')[1]?.substring(0, 5) || '00:00' // Get HH:MM from ISO string
  
  // Check if experience has a real timestamp (not midnight)
  const hasTime = timeOnly !== '00:00'
  
  const [formData, setFormData] = useState({
    title: experience.title,
    content: experience.content,
    date: dateOnly,
    time: timeOnly, // HH:MM format from ISO string
    category: experience.category,
    isPublic: experience.isPublic,
    tags: experience.tags?.join(', ') || '',
    mood: experience.mood || '',
    location: experience.location || ''
  })
  const [includeTimestamp, setIncludeTimestamp] = useState(hasTime)

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category)
  const SelectedIcon = selectedCategory?.icon || FiTag
  
  const selectedMood = MOODS.find(mood => mood.value === formData.mood)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Show loading immediately before any async operations
    setLoading(true)

    // Small delay to ensure loading UI renders before heavy operations
    await new Promise(resolve => setTimeout(resolve, 0))

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // Prepare data without the 'time' field (not a DB field)
      const { time, date, ...updateData } = formData

      // Check if date or timestamp changed
      // Extract date and time directly from ISO string to avoid timezone conversion
      const originalDateOnly = originalDate.split('T')[0]
      const originalTimeOnly = originalDate.split('T')[1]?.substring(0, 5) || '00:00'
      
      const dateChanged = date !== originalDateOnly
      const timeChanged = formData.time !== originalTimeOnly
      const timestampToggled = includeTimestamp !== hasTime

      // Only update date field if date/time actually changed
      // Use local timezone offset to store the correct UTC representation
      let finalDate
      if (dateChanged || timeChanged || timestampToggled) {
        if (includeTimestamp && formData.time) {
          // Create Date from local values and convert to ISO
          const localDate = new Date(`${date}T${formData.time}:00`)
          finalDate = localDate.toISOString()
        } else {
          // No timestamp - noon local time to avoid date shift across timezones
          const localDate = new Date(`${date}T12:00:00`)
          finalDate = localDate.toISOString()
        }
      } else {
        // No date/time changes - keep original date unchanged
        finalDate = originalDate
      }

      // Use apiClient to call backend API
      await apiClient.experiences.update(experience.id, {
        ...updateData,
        tags: tagsArray,
        date: finalDate,
      })

      toast.success('Experience updated!')
      // Keep loading state during navigation
      await router.push(`/experiences/${experience.id}`)
      // Don't set loading to false - let the page transition handle it
    } catch (err) {
      toast.error(err.message || 'Failed to update experience')
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-8 pt-20 lg:pt-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <Link 
            href={`/experiences/${experience.id}`}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <FiArrowLeft size={20} />
            Back to Experience
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Experience ✏️
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Update your moment
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <FiAlertCircle className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" size={18} />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-300">Error</p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
                placeholder="Give your experience a title..."
              />
            </div>

            {/* Content */}
            <div className="mb-6">
              <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Experience *
              </label>
              <textarea
                id="content"
                required
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
                placeholder="Describe your experience in detail..."
              />
            </div>

            {/* Date and Category Row */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              {/* Date */}
              <div>
                <label htmlFor="date" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiCalendar className="mr-1 inline" size={16} />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              {/* Time */}
              <div>
                <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-2">
                    <FiClock className="h-4 w-4" />
                    Time (Optional)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIncludeTimestamp(!includeTimestamp)}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
                  >
                    {includeTimestamp ? (
                      <>
                        <FiX className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">Remove</span>
                      </>
                    ) : (
                      <>
                        <FiClock className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-purple-600 dark:text-purple-400">Add</span>
                      </>
                    )}
                  </button>
                </label>
                {includeTimestamp ? (
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                ) : (
                  <div className="w-full rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-4 py-2.5 text-center text-sm text-gray-400 dark:text-gray-500">
                    No timestamp
                  </div>
                )}
              </div>
            </div>

            {/* Category and Mood Row */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              {/* Category Dropdown */}
              <div ref={categoryDropdown.dropdownRef}>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiTag className="mr-1 inline" size={16} />
                  Category *
                </label>
                <button
                  type="button"
                  onClick={categoryDropdown.toggle}
                  className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    <SelectedIcon className={selectedCategory?.color} size={18} />
                    <span>{selectedCategory?.label}</span>
                  </span>
                  <FiChevronDown className={`transition-transform ${categoryDropdown.isOpen ? 'rotate-180' : ''}`} size={18} />
                </button>

                {categoryDropdown.isOpen && (
                  <div className="absolute z-10 mt-2 w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800 max-h-80 overflow-y-auto">
                    {CATEGORIES.map((category) => {
                      const Icon = category.icon
                      return (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, category: category.value })
                            categoryDropdown.close()
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700/50 ${
                            formData.category === category.value ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                          }`}
                        >
                          <Icon className={category.color} size={20} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{category.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Mood Dropdown */}
              <div ref={moodDropdown.dropdownRef}>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiSmile className="mr-1 inline" size={16} />
                  Mood
                </label>
                <button
                  type="button"
                  onClick={moodDropdown.toggle}
                  className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <span className="flex items-center gap-2">
                    {selectedMood ? (
                      <>
                        <span className="text-xl">{selectedMood.emoji}</span>
                        <span>{selectedMood.label}</span>
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Select your mood</span>
                    )}
                  </span>
                  <FiChevronDown className={`transition-transform ${moodDropdown.isOpen ? 'rotate-180' : ''}`} size={18} />
                </button>

                {moodDropdown.isOpen && (
                  <div className="absolute z-10 mt-2 w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800 max-h-80 overflow-y-auto">
                    {MOODS.map((mood) => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, mood: mood.value })
                          moodDropdown.close()
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-zinc-700/50 ${
                          formData.mood === mood.value ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                        }`}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{mood.label}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, mood: '' })
                        moodDropdown.close()
                      }}
                      className="w-full border-t border-gray-200 dark:border-zinc-700 px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-700/50"
                    >
                      Clear mood
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Location and Tags Row */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              {/* Location */}
              <div>
                <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiMapPin className="mr-1 inline" size={16} />
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
                  placeholder="Where did this happen?"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  <FiTag className="mr-1 inline" size={16} />
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
                  placeholder="Separate tags with commas"
                />
              </div>
            </div>

            {/* Privacy Toggle */}
            <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Who can see this experience?
              </h3>
              
              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 transition-all hover:border-gray-300 dark:hover:border-zinc-600 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!formData.isPublic}
                    onChange={() => setFormData({ ...formData, isPublic: false })}
                    className="mt-1 h-5 w-5 cursor-pointer accent-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FiLock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Private
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Only you can see this experience. Keep it personal and private.
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-start gap-4 rounded-lg border-2 border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 transition-all hover:border-gray-300 dark:hover:border-zinc-600 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50 dark:has-[:checked]:bg-emerald-900/20">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.isPublic}
                    onChange={() => setFormData({ ...formData, isPublic: true })}
                    className="mt-1 h-5 w-5 cursor-pointer accent-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FiGlobe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Public
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Share with the community. Others can read and share reflections.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href={`/experiences/${experience.id}`}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-gray-300 dark:hover:bg-zinc-800"
            >
              <FiX size={18} />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiSave size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="text-center">
            <PuzzleLoader />
            <p className="mt-6 text-xl font-bold text-white animate-pulse drop-shadow-lg">
              Saving changes...
            </p>
            <p className="mt-2 text-sm text-gray-300">
              Please wait
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
