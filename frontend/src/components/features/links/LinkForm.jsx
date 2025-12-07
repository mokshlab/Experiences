'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiSave, FiX } from 'react-icons/fi'
import { PuzzleLoader, useToast } from '@/components/common'
import { apiClient } from '@/lib/api-client'

const PRESET_COLORS = [
  { name: 'Neural Pink', value: '#ec4899' },
  { name: 'Synapse Purple', value: '#a855f7' },
  { name: 'Electric Blue', value: '#3b82f6' },
  { name: 'Neuron Cyan', value: '#06b6d4' },
  { name: 'Dendrite Teal', value: '#14b8a6' },
  { name: 'Cortex Green', value: '#10b981' },
  { name: 'Impulse Orange', value: '#f97316' },
  { name: 'Firing Red', value: '#ef4444' },
  { name: 'Axon Indigo', value: '#6366f1' },
  { name: 'Signal Violet', value: '#8b5cf6' },
  { name: 'Brain Rose', value: '#f43f5e' },
  { name: 'Thought Gold', value: '#f59e0b' }
]

export default function LinkForm({ link = null }) {
  const router = useRouter()
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: link?.name || '',
    description: link?.description || '',
    color: link?.color || '#a855f7'
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Link name is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      if (link) {
        // Update existing link
        await apiClient.links.update(link.id, formData)
        toast.success('Link updated!')
      } else {
        // Create new link (without experiences - can be added later from timeline)
        await apiClient.links.create(formData)
        toast.success('Neural pathway created!')
      }

      router.push('/links')
      router.refresh()
    } catch (error) {
      console.error('Error saving link:', error)
      toast.error(error.message || 'Failed to save link')
      setErrors({ submit: error.message || 'Failed to save link' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-white/10 shadow-sm">
        {/* Link Name */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Link Name <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Career Pathway, Fitness Evolution, Growth Journey"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-gray-400 dark:text-gray-500">(optional)</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="How these experiences connect like neural pathways..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Neural Pathway Color 🧠
          </label>
          <div className="grid grid-cols-6 gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className={`h-12 rounded-xl transition-all relative overflow-hidden ${
                  formData.color === color.value
                    ? 'ring-2 ring-purple-600 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-900 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {formData.color === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-2xl drop-shadow-lg">⚡</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Choose a color for your neural pathway - it will pulse through your timeline
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <PuzzleLoader />
              <span>Creating Neural Pathway...</span>
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              <span>{link ? 'Update Link' : 'Create Link'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiX className="w-5 h-5 inline mr-2" />
          Cancel
        </button>
      </div>
    </form>
  )
}
