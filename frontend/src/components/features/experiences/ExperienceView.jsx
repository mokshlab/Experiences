"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FiArrowLeft, FiEdit2, FiTrash2, FiCalendar, FiMapPin, 
  FiTag, FiLock, FiGlobe, FiAlertCircle, FiX, FiClock
} from 'react-icons/fi'
import { CATEGORY_CONFIG, MOOD_EMOJIS } from '@/lib/constants'
import { apiClient } from '@/lib/api-client'
import { PuzzleLoader, useToast } from '@/components/common'
import { ReflectionsSection } from '@/components/features/reflections'
import { ExperienceLinks } from '@/components/features/links'
import { formatDateTime } from '@/utils'

// Mood-based gradient themes for the memory card header
const MOOD_GRADIENTS = {
  happy: 'from-amber-400 via-orange-400 to-yellow-300',
  excited: 'from-pink-500 via-rose-400 to-orange-400',
  grateful: 'from-emerald-400 via-teal-400 to-cyan-400',
  peaceful: 'from-blue-400 via-indigo-300 to-purple-300',
  reflective: 'from-violet-400 via-purple-400 to-indigo-400',
  proud: 'from-amber-500 via-yellow-400 to-orange-400',
  nostalgic: 'from-purple-400 via-pink-300 to-rose-300',
  sad: 'from-slate-400 via-blue-400 to-indigo-400',
  anxious: 'from-gray-400 via-zinc-400 to-slate-400',
  frustrated: 'from-red-400 via-orange-400 to-amber-400',
  confused: 'from-violet-400 via-fuchsia-400 to-pink-400',
  hopeful: 'from-cyan-400 via-sky-400 to-blue-400',
  inspired: 'from-fuchsia-400 via-purple-400 to-violet-500',
  neutral: 'from-gray-400 via-slate-300 to-zinc-400',
}

const DEFAULT_GRADIENT = 'from-purple-500 via-purple-400 to-pink-400'

export default function ExperienceView({ experience, isOwner, currentUserId, from = 'dashboard' }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const toast = useToast()
  
  // Determine back URL from prop passed from server component
  const backUrl = from === 'explore' ? '/explore' : '/dashboard'
  const backText = from === 'explore' ? 'Back to Explore' : 'Back to Dashboard'
  // When returning to dashboard, include a timestamp to force server revalidation
  const backHref = from === 'explore' ? '/explore' : `/dashboard?ts=${Date.now()}`

  const categoryConfig = CATEGORY_CONFIG[experience.category] || CATEGORY_CONFIG.OTHER
  const CategoryIcon = categoryConfig.icon
  const moodEmoji = MOOD_EMOJIS[experience.mood]
  const gradient = MOOD_GRADIENTS[experience.mood] || DEFAULT_GRADIENT

  // Format relative time for the "memory age"
  const daysSince = Math.floor((Date.now() - new Date(experience.date).getTime()) / (1000 * 60 * 60 * 24))
  const memoryAge = daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince} days ago`

  const handleDelete = async () => {
    setIsDeleting(true)
    
    // Small delay to ensure loading UI renders
    await new Promise(resolve => setTimeout(resolve, 0))
    
    try {
      await apiClient.experiences.delete(experience.id)
      
      toast.success('Experience deleted')
      // Trigger server-side revalidation for dashboard
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: ['/dashboard'] })
        })
      } catch (e) {
        console.warn('revalidate call failed', e)
      }
      // Keep loading during navigation and force dashboard server to fetch fresh data
      await router.push(`${backUrl}?ts=${Date.now()}`)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Something went wrong')
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            href={backHref}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <FiArrowLeft size={20} />
            {backText}
          </Link>

          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/experiences/${experience.id}/edit`}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
              >
                <FiEdit2 size={16} />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 rounded-lg bg-red-50 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
              >
                <FiTrash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Memory Card */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          {/* Gradient Header */}
          <div className={`relative bg-gradient-to-r ${gradient} px-8 py-8`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              {/* Mood + Category Row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {moodEmoji && (
                    <span className="text-4xl drop-shadow-lg">{moodEmoji}</span>
                  )}
                  <div
                    className="flex items-center gap-1.5 rounded-full bg-white/20 dark:bg-slate-800/30 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    <CategoryIcon size={14} />
                    {categoryConfig.label}
                  </div>
                </div>
                {/* Privacy badge */}
                <div
                  className="flex items-center gap-1 rounded-full bg-white/20 dark:bg-slate-800/30 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white"
                >
                  {experience.isPublic ? (
                    <>
                      <FiGlobe size={12} />
                      Public
                    </>
                  ) : (
                    <>
                      <FiLock size={12} />
                      Private
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm leading-tight">
                {experience.title}
              </h1>

              {/* Date & Location */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-white/80 text-sm">
                <div className="flex items-center gap-1.5">
                  <FiCalendar size={14} />
                  <span>{formatDateTime(experience.date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FiClock size={14} />
                  <span>{memoryAge}</span>
                </div>
                {experience.location && (
                  <div className="flex items-center gap-1.5">
                    <FiMapPin size={14} />
                    <span>{experience.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-8 py-8">
            {/* Content */}
            <div className="prose prose-lg prose-gray max-w-none dark:prose-invert mb-8">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {experience.content}
              </p>
            </div>

            {/* Tags */}
            {experience.tags && experience.tags.length > 0 && (
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <FiTag size={14} />
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {experience.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-zinc-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mood label if present */}
            {experience.mood && moodEmoji && (
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                <span className="text-lg">{moodEmoji}</span>
                Feeling {experience.mood}
              </div>
            )}

            {/* Memory Links */}
            <ExperienceLinks 
              experienceId={experience.id}
              isOwner={isOwner}
            />
          </div>
        </div>

        {/* Reflections Section */}
        <div className="mt-8">
          <ReflectionsSection 
            experienceId={experience.id} 
            isPublic={experience.isPublic}
            currentUserId={currentUserId}
          />
        </div>

        {/* Owner Warning for Private */}
        {isOwner && !experience.isPublic && (
          <div className="mt-6 flex items-start gap-3 rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <FiAlertCircle className="mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" size={18} />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-300">
                  Private Experience
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                  This experience is only visible to you. Make it public to receive reflections from the community.
                </p>
              </div>
            </div>
          )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md transform transition-all animate-in zoom-in-95 duration-200">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
              {/* Header with Icon */}
              <div className="flex flex-col items-center gap-4 border-b border-gray-200 p-6 dark:border-zinc-800">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 shadow-lg">
                  <FiTrash2 className="h-8 w-8 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Delete this experience?
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 dark:border-purple-900/50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    "{experience.title}"
                  </p>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    This experience and all associated data will be permanently deleted.
                  </p>
                </div>

                {/* Warning Box */}
                <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-3 dark:border-amber-900/50 dark:from-amber-900/20 dark:to-orange-900/20">
                  <FiAlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <strong>Warning:</strong> This will permanently delete your experience, including all reflections and comments.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-gray-200 p-6 dark:border-zinc-800">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700 dark:hover:border-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:from-orange-700 hover:via-red-700 hover:to-pink-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </span>
                  ) : (
                    'Delete Forever'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deleting Overlay with Puzzle Animation */}
      {isDeleting && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="text-center">
            <PuzzleLoader variant="delete" />
            <p className="mt-6 text-xl font-bold text-white animate-pulse drop-shadow-lg">
              Deleting experience...
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
