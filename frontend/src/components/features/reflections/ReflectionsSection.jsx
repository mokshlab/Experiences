'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FiUser, FiMessageCircle, FiTrash2 } from 'react-icons/fi'
import { apiClient } from '@/lib/api-client'
import { Pagination, useToast } from '@/components/common'
import { AddReflection } from './'
import { formatDate } from '@/utils'

const FEELING_STYLES = {
  // Positive & Uplifting
  inspired: { emoji: '✨', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  grateful: { emoji: '🙏', color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  hopeful: { emoji: '🌟', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  motivated: { emoji: '🔥', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  proud: { emoji: '🎯', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  
  // Connected & Empathetic
  related: { emoji: '🤝', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  supportive: { emoji: '💪', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  moved: { emoji: '💝', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  understood: { emoji: '👁️', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  
  // Thoughtful & Reflective
  curious: { emoji: '🤔', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  enlightened: { emoji: '💡', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  reflective: { emoji: '🧘', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/20' },
  challenged: { emoji: '🎲', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  
  // Vulnerable & Real
  emotional: { emoji: '😢', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  nostalgic: { emoji: '🕰️', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  validated: { emoji: '✅', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/30' },
}

export default function ReflectionsSection({ experienceId, isPublic, currentUserId }) {
  const [reflections, setReflections] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [deletingId, setDeletingId] = useState(null)
  const toast = useToast()
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 20,
    total: 0,
    totalPages: 1
  })

  useEffect(() => {
    if (isPublic) {
      fetchReflections()
    }
  }, [experienceId, isPublic, page])

  const fetchReflections = async () => {
    setLoading(true)
    try {
      const data = await apiClient.reflections.getByExperienceId(experienceId, page, 20)
      setReflections(data.reflections)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching reflections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReflectionAdded = (newReflection) => {
    // Refetch reflections to get the complete data with user info
    fetchReflections()
  }

  const handleDeleteReflection = async (reflectionId) => {
    setDeletingId(reflectionId)
    try {
      await apiClient.reflections.delete(experienceId, reflectionId)
      toast.success('Reflection deleted')
      fetchReflections()
    } catch (error) {
      console.error('Error deleting reflection:', error)
      toast.error('Failed to delete reflection. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    // Scroll to reflections section
    document.getElementById('reflections-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!isPublic) {
    return null
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <FiMessageCircle className="h-5 w-5 animate-pulse" />
          <span>Loading reflections...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6" id="reflections-section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiMessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reflections
          </h2>
          <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
            {pagination.total}
          </span>
        </div>
      </div>

      {/* Add Reflection Form */}
      <AddReflection experienceId={experienceId} onReflectionAdded={handleReflectionAdded} />

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Reflections List */}
          <div className="space-y-4">
            {reflections.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-3 text-4xl">💭</div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  No reflections yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              reflections.map((reflection) => {
                const feelingStyle = reflection.feeling ? FEELING_STYLES[reflection.feeling] : null
                const isOwnReflection = reflection.userId === currentUserId

                return (
                  <div
                    key={reflection.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    {/* User Info */}
                    <div className="mb-3 flex items-center gap-3">
                      {reflection.user?.image ? (
                        <Image
                          src={reflection.user.image}
                          alt={reflection.user.name || 'User'}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                          <FiUser className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {reflection.user?.name || 'Anonymous'}
                          </p>
                          {isOwnReflection && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(reflection.createdAt, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {/* Feeling Badge */}
                      {feelingStyle && (
                        <div className={`rounded-full px-3 py-1 text-sm font-medium ${feelingStyle.bg} ${feelingStyle.color}`}>
                          {feelingStyle.emoji} {reflection.feeling}
                        </div>
                      )}

                      {/* Delete Button (only for own reflections) */}
                      {isOwnReflection && (
                        <button
                          onClick={() => handleDeleteReflection(reflection.id)}
                          disabled={deletingId === reflection.id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                          title="Delete reflection"
                        >
                          {deletingId === reflection.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiTrash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {reflection.content}
                    </p>
                  </div>
                )
              })
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                isLoading={loading}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
