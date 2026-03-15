'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiLink, FiCalendar, FiTrash2, FiEdit2 } from 'react-icons/fi'
import { CATEGORIES } from '@/lib/constants'
import { formatShortDate } from '@/utils'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/components/common'

export default function LinksList({ links: initialLinks }) {
  const [links, setLinks] = useState(Array.isArray(initialLinks) ? initialLinks : [])
  const [deletingId, setDeletingId] = useState(null)
  const router = useRouter()
  const toast = useToast()

  const handleDelete = async (linkId) => {
    setDeletingId(linkId)

    try {
      await apiClient.links.delete(linkId)
      // Optimistically remove from UI
      setLinks(links.filter(l => l.id !== linkId))
      // Ensure server-rendered pages revalidate and stay in sync
      try { router.refresh() } catch (e) { /* best-effort */ }
      toast.success('Link deleted successfully')
    } catch (error) {
      console.error('Error deleting link:', error)
      toast.error(error.message || 'Failed to delete link')
    } finally {
      setDeletingId(null)
    }
  }

  // Sync when parent updates links prop (e.g., after client-side refresh)
  useEffect(() => {
    setLinks(initialLinks)
  }, [initialLinks])

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {links.map((link, index) => (
        <div
          key={link.id}
          className="relative bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 group hover:scale-105 hover:shadow-2xl hover:ring-1 hover:ring-purple-300/30 dark:hover:ring-1 dark:hover:ring-purple-600/30 flex flex-col"
          style={{
            animationName: 'fadeInUp',
            animationDuration: '0.6s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationDelay: `${index * 100}ms`
          }}
        >
          {/* Animated glow effect */}
          <div 
            className="absolute inset-0 transition-opacity duration-500 blur-xl link-card-overlay group-hover:opacity-40"
            style={{ 
              background: `radial-gradient(circle at 50% 50%, ${link.color}, transparent 70%)`
            }}
          />

          {/* Color Stripe with pulse */}
          <div className="relative h-2 overflow-hidden">
            <div
              className="absolute inset-0 animate-pulse color-stripe"
              style={{ backgroundColor: link.color }}
            />
            <div
              className="absolute inset-0 animate-shimmer"
              style={{ 
                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                transform: 'translateX(-100%)'
              }}
            />
          </div>

          {/* Content */}
            <div className="relative px-4 py-5 z-10 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <Link href={`/links/${link.id}`} className="flex-1 group/title">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full animate-pulse" 
                    style={{ backgroundColor: link.color, boxShadow: `0 0 10px ${link.color}` }}
                  />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover/title:text-transparent group-hover/title:bg-gradient-to-r group-hover/title:from-pink-400 group-hover/title:via-purple-400 group-hover/title:to-blue-400 group-hover/title:bg-clip-text transition-all duration-300">
                    {link.name}
                  </h3>
                </div>
              </Link>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-2">
                <Link
                  href={`/links/${link.id}/edit`}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-purple-400 transition-all transform hover:scale-110"
                  title="Edit neural pathway"
                >
                  <FiEdit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(link.id)}
                  disabled={deletingId === link.id}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all disabled:opacity-50 transform hover:scale-110"
                  title="Delete neural pathway"
                >
                  {deletingId === link.id ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiTrash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {link.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                {link.description}
              </p>
            )}

            {/* Preview of experiences */}
            {link.experienceLinks && link.experienceLinks.length > 0 && (
              <div className="space-y-1.5 border-t border-gray-200 dark:border-white/10 pt-4 mt-4 flex-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-3 flex items-center gap-2">
                  <span className="w-5 text-center">⚡</span>
                  <span>NEURAL CONNECTIONS</span>
                </div>
                {link.experienceLinks.map((ec) => {
                  const exp = ec.experience || {}
                  const category = CATEGORIES.find(c => c.value === exp.category)
                  const IconComponent = category?.icon
                  return (
                    <div
                      key={exp.id || `${link.id}-${Math.random().toString(36).slice(2,7)}`}
                      className="flex items-center gap-2 text-sm py-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all group/exp"
                    >
                      <div 
                        className="w-5 h-5 flex items-center justify-center rounded-lg flex-shrink-0"
                        style={{ backgroundColor: `${link.color}20` }}
                      >
                        {IconComponent ? (
                          <IconComponent className="w-3 h-3" style={{ color: link.color }} />
                        ) : (
                          <span className="text-sm">📝</span>
                        )}
                      </div>
                      <span className="text-gray-700 dark:text-gray-200 flex-1 truncate group-hover/exp:text-gray-900 dark:group-hover/exp:text-white transition-colors">
                        {exp.title || 'Untitled experience'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-300 text-[11px] font-mono font-semibold tracking-tight">
                        {formatShortDate(exp.date)}
                      </span>
                    </div>
                  )
                })}
                {(link._count?.experienceLinks || 0) > 3 && (
                  <Link
                    href={`/links/${link.id}`}
                    className="flex items-center justify-center gap-2 text-sm py-2 pt-3 text-purple-300 font-semibold hover:text-purple-200 transition-all"
                  >
                    <span className="w-5 text-center">+</span>
                    <span>{link._count.experienceLinks - 3} more connections →</span>
                  </Link>
                )}
              </div>
            )}

            {/* View Link Timeline */}
            <Link
              href={`/links/${link.id}`}
              className="group/btn relative block mt-auto pt-5 text-center py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-white/5 dark:to-white/10 hover:from-gray-300 hover:to-gray-400 dark:hover:from-white/10 dark:hover:to-white/15 text-gray-700 dark:text-white rounded-lg transition-all overflow-hidden font-semibold"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity"
                style={{ 
                  background: `linear-gradient(90deg, transparent, ${link.color}30, transparent)`,
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>View Timeline</span>
                <span className="transform group-hover/btn:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
