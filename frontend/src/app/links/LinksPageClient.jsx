 'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FiZap, FiGrid, FiShare2, FiGitBranch } from 'react-icons/fi'
import PageHeader from '@/components/layout/PageHeader'
import { LinksList, TimelineRiverFlow, ForceGraph } from '@/components/features/links'

export default function LinksPageClient({ links }) {
  const [viewMode, setViewMode] = useState('grid') // 'grid', 'river', or 'graph'
  const [linksState, setLinksState] = useState(Array.isArray(links) ? links : [])

  // Refresh links client-side on mount to ensure newly-created links show immediately
  useEffect(() => {
    let mounted = true
    async function refresh() {
      try {
        const fresh = await import('@/lib/api-client').then(m => m.apiClient.links.getAll())
        if (mounted && Array.isArray(fresh)) {
          setLinksState(fresh)
        }
      } catch (err) {
        // ignore — keep server-provided links
      }
    }
    refresh()
    return () => { mounted = false }
  }, [])

  return (
    <div className="relative">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="relative mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 sm:gap-6 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <PageHeader icon={<FiGitBranch className="h-5 w-5" />} title="Neural Pathways" subtitle="Connect experiences like neurons - build your memory network" />
            </div>

            {/* Create New Link Button */}
            <Link
              href="/links/new"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-2xl hover:scale-105 overflow-hidden text-sm sm:text-base whitespace-nowrap"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <FiZap className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10">Create Neural Link</span>
            </Link>
          </div>

          {/* View Controls */}
          {linksState.length > 0 && (
            <div className="flex items-center justify-between gap-4 mb-6">
              {/* View Mode Toggle */}
              <div className="inline-flex rounded-xl bg-gray-100 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    viewMode === 'grid'
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiGrid size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Grid View</span>
                  <span className="sm:hidden">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('river')}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    viewMode === 'river'
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiShare2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">River View</span>
                  <span className="sm:hidden">River</span>
                </button>
                <button
                  onClick={() => setViewMode('graph')}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    viewMode === 'graph'
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiGitBranch size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Graph View</span>
                  <span className="sm:hidden">Graph</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {linksState.length === 0 ? (
          <div className="relative links-hero links-empty rounded-2xl p-8 sm:p-12 text-center border border-gray-200 dark:border-white/10 overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden opacity-20 hero-bg">
              <div className="absolute top-0 left-1/4 w-32 h-32 bg-pink-500 rounded-full blur-2xl animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse delay-1000" />
            </div>
            
              <div className="relative z-10">
              {/* Dynamic brain icon - subtle floating animation to draw attention */}
              <div className="relative mx-auto mb-4 w-fit">
                <span className="text-6xl sm:text-7xl block mb-0 brain-float" aria-hidden="true">🧠</span>
                <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-20 blur-2xl" aria-hidden="true" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
                No Memory Links Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed px-4">
                Create your first neural pathway to connect related experiences together. 
                <span className="block mt-2 text-purple-600 dark:text-purple-300">
                  Like neurons forming pathways in your brain, link career milestones, 
                  relationship journeys, or track personal growth over time.
                </span>
              </p>
              
              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 sm:mb-8 max-w-3xl mx-auto">
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-purple-500/20">
                  <span className="text-3xl block mb-2">⚡</span>
                  <div className="text-sm text-purple-600 dark:text-purple-300 font-semibold">Connect Experiences</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Link related memories</div>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-pink-500/20">
                  <span className="text-3xl block mb-2">🌊</span>
                  <div className="text-sm text-pink-600 dark:text-pink-300 font-semibold">River View</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">See timeline flow</div>
                </div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-blue-500/20 sm:col-span-2 md:col-span-1">
                  <span className="text-3xl block mb-2">🎨</span>
                  <div className="text-sm text-blue-600 dark:text-blue-300 font-semibold">Custom Colors</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Personalize pathways</div>
                </div>
              </div>

              <Link
                href="/links/new"
                className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-2xl hover:scale-105 text-base sm:text-lg"
              >
                <FiZap className="w-5 h-5 sm:w-6 sm:h-6" />
                Create Your First Neural Pathway
              </Link>
            </div>
          </div>
        ) : (
          <>
              {viewMode === 'grid' && <LinksList links={linksState} />}
            {viewMode === 'river' && (
              <div className="mb-8">
                <TimelineRiverFlow links={linksState} />
              </div>
            )}
            {viewMode === 'graph' && (
              <div className="mb-8">
                <ForceGraph links={linksState} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
