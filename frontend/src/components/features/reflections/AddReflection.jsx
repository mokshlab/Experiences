'use client'

import { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/components/common'

const FEELINGS = [
  { value: 'inspired', label: '✨ Inspired', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { value: 'related', label: '🤝 I Relate', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { value: 'supportive', label: '💪 Supportive', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  { value: 'moved', label: '💝 Moved', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  { value: 'curious', label: '🤔 Curious', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { value: 'grateful', label: '🙏 Grateful', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
]

export default function AddReflection({ experienceId, onReflectionAdded }) {
  const toast = useToast()
  const [content, setContent] = useState('')
  const [feeling, setFeeling] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('Please write your reflection')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const newReflection = await apiClient.reflections.create(experienceId, {
        content: content.trim(),
        feeling: feeling || null
      })
      
      toast.success('Reflection shared!')
      setContent('')
      setFeeling('')
      onReflectionAdded(newReflection)
    } catch (err) {
      // Only log unexpected errors (not rate limit or validation errors)
      if (err.status !== 429 && err.status !== 400) {
        console.error('Error adding reflection:', err)
      }
      toast.error(err.message || 'Something went wrong')
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
        Share Your Reflection
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What are your thoughts on this experience?"
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
        />

        {/* Feeling Selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            How does this make you feel? <span className="text-gray-500 dark:text-gray-400">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FEELINGS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFeeling(feeling === f.value ? '' : f.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  feeling === f.value
                    ? `${f.bg} ${f.color} ring-2 ring-current shadow-md`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition-all hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiSend className="h-4 w-4" />
          {isSubmitting ? 'Posting...' : 'Post Reflection'}
        </button>
      </form>
    </div>
  )
}
