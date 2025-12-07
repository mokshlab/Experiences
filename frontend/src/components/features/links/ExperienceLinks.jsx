'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiLink, FiX, FiPlus } from 'react-icons/fi'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/components/common'

export default function ExperienceLinks({ experienceId, isOwner }) {
  const [links, setLinks] = useState([])
  const [availableLinks, setAvailableLinks] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const toast = useToast()

  useEffect(() => {
    if (isOwner) {
      fetchData()
    }
  }, [experienceId, isOwner])

  const fetchData = async () => {
    try {
      // Fetch user's links with all experience IDs to properly check membership
      const links = await apiClient.links.getAll(true)
      
      // Find which links contain this experience
      const containingLinks = links.filter(link =>
        link.experienceLinks.some(ec => ec.experienceId === experienceId || ec.experience.id === experienceId)
      )
      
      // Get available links (not containing this experience)
      const available = links.filter(link =>
        !link.experienceLinks.some(ec => ec.experienceId === experienceId || ec.experience.id === experienceId)
      )
      
      setLinks(containingLinks)
      setAvailableLinks(available)
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToLink = async (linkId) => {
    setAddingId(linkId)

    try {
      await apiClient.links.addExperience(linkId, experienceId)
      await fetchData()
      setShowAddModal(false)
      toast.success('Experience linked')
    } catch (error) {
      console.error('Error adding to link:', error)
      if (!error.message?.includes('already linked')) {
        toast.error(error.message || 'Failed to add to link')
      }
    } finally {
      setAddingId(null)
    }
  }

  const handleRemoveFromLink = async (linkId) => {
    setRemovingId(linkId)

    try {
      await apiClient.links.removeExperience(linkId, experienceId)
      await fetchData()
      toast.success('Experience unlinked')
    } catch (error) {
      console.error('Error removing from link:', error)
      toast.error(error.message || 'Failed to remove from link')
    } finally {
      setRemovingId(null)
    }
  }

  if (!isOwner) {
    return null
  }

  if (loading) {
    return (
      <div className="border-t border-gray-200 dark:border-zinc-800 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
          <FiLink size={16} />
          <span>Loading links...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="border-t border-gray-200 dark:border-zinc-800 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="text-lg">🧠</span>
            <span>Memory Links</span>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-sm bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 font-semibold transition-colors"
          >
            + Add to Link
          </button>
        </div>

        {links.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            This experience isn't connected to any neural pathways yet.
          </p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-zinc-900 rounded-lg p-3 border border-gray-200 dark:border-zinc-800 relative overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-5"
                  style={{ 
                    background: `radial-gradient(circle at 0% 50%, ${link.color}, transparent 70%)`
                  }}
                />
                <Link
                  href={`/links/${link.id}`}
                  className="flex items-center gap-2 flex-1 min-w-0 relative z-10"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 relative"
                    style={{ backgroundColor: link.color }}
                  >
                    <div 
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ backgroundColor: link.color, opacity: 0.5 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate">
                    {link.name}
                  </span>
                </Link>
                <button
                  onClick={() => handleRemoveFromLink(link.id)}
                  disabled={removingId === link.id}
                  className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 relative z-10"
                  title="Disconnect from neural pathway"
                >
                  {removingId === link.id ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiX size={16} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add to Link Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧠</span>
                <h2 className="text-xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Connect to Link
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-gray-400 transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {availableLinks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This experience is connected to all your neural pathways!
                  </p>
                  <Link
                    href="/links/new"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all"
                  >
                    <FiPlus className="w-5 h-5" />
                    Create New Link
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleAddToLink(link.id)}
                      disabled={addingId === link.id}
                      className="w-full bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-700 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: link.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 dark:text-white font-semibold truncate">
                            {link.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {link._count.experienceLinks} {link._count.experienceLinks === 1 ? 'experience' : 'experiences'}
                          </p>
                        </div>
                        {addingId === link.id ? (
                          <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        ) : (
                          <FiPlus className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
