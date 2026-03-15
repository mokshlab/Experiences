'use client'

import { useState, useEffect } from 'react'
import { ExperienceCard } from '@/components/features/experiences'
import { Pagination } from '@/components/common'
import { CATEGORIES, API_BASE_URL } from '@/lib/constants'
import { FiGlobe, FiFilter, FiUser, FiUsers } from 'react-icons/fi'
import PageHeader from '@/components/layout/PageHeader'

export default function ExploreContent({ initialExperiences, currentUserId }) {
  const [activeTab, setActiveTab] = useState('community')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [experiences, setExperiences] = useState(Array.isArray(initialExperiences) ? initialExperiences : [])
  const [page, setPage] = useState(0)
  const [pagination, setPagination] = useState({ page: 0, limit: 20, total: experiences.length, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function fetchExperiences() {
      setIsLoading(true)
      try {
        const categoryParam = selectedCategory === 'ALL' ? '' : `&category=${selectedCategory}`
        const res = await fetch(`${API_BASE_URL}/explore?page=${page}&limit=20${categoryParam}`, { credentials: 'include' })
        const data = await res.json()
        if (!mounted) return
        const list = Array.isArray(data?.experiences) ? data.experiences : (Array.isArray(data) ? data : [])
        setExperiences(list)
        if (data?.pagination) setPagination(data.pagination)
      } catch (e) {
        console.error('Explore fetch error', e)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }
    fetchExperiences()
    return () => { mounted = false }
  }, [selectedCategory, page])

  const experiencesArray = Array.isArray(experiences) ? experiences : []
  const communityExperiences = experiencesArray.filter(e => e.userId !== currentUserId)
  const myExperiences = experiencesArray.filter(e => e.userId === currentUserId)
  const currentExperiences = activeTab === 'community' ? communityExperiences : myExperiences

  const catLabel = CATEGORIES.find(c => c.value === selectedCategory)?.label || ''
  const emptyMessage = activeTab === 'my'
    ? (selectedCategory === 'ALL' ? "You haven't shared any public experiences yet. Create one and make it public to share with the community!" : `You haven't shared any public experiences in ${catLabel} category yet.`)
    : (selectedCategory === 'ALL' ? 'No public experiences from the community yet. Be the first to share!' : `No public experiences in ${catLabel} category yet.`)

  const handleCategoryChange = (category) => { setSelectedCategory(category); setPage(0) }
  const handlePageChange = (n) => { setPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="p-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <PageHeader icon={<FiGlobe className="h-5 w-5" />} title="Explore" subtitle={activeTab === 'community' ? 'Discover experiences from the community' : 'Your public experiences'} />
        </div>

        <div className="mt-6 mb-8">
          <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10">
            <button
              onClick={() => { setActiveTab('my'); setSelectedCategory('ALL'); setPage(0) }}
              className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                activeTab === 'my'
                  ? 'bg-white text-purple-600 shadow-md dark:bg-zinc-900 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FiUser className="h-4 w-4" />
              <span>My Content</span>
              <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{myExperiences.length}</span>
            </button>
            <button
              onClick={() => { setActiveTab('community'); setSelectedCategory('ALL'); setPage(0) }}
              className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                activeTab === 'community'
                  ? 'bg-white text-purple-600 shadow-md dark:bg-zinc-900 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FiUsers className="h-4 w-4" />
              <span>Community</span>
              <span className="ml-2 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">{communityExperiences.length}</span>
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3"><FiFilter className="h-4 w-4 text-gray-500 dark:text-gray-400" /><span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by category</span></div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleCategoryChange('ALL')} className={selectedCategory === 'ALL' ? 'rounded-full px-4 py-2 text-sm font-medium bg-purple-600 text-white' : 'rounded-full px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700'}>All</button>
            {CATEGORIES.map(cat => {
              const CategoryIcon = cat.icon
              const isSelected = selectedCategory === cat.value
              const extra = isSelected ? 'shadow-lg border-2 border-current' : 'hover:shadow-md hover:scale-105'
              return (
                <button key={cat.value} onClick={() => handleCategoryChange(cat.value)} className={`rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 ${cat.bgColor} ${cat.color} ${extra}`}>
                  <CategoryIcon className="h-4 w-4" />{cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" /></div>
        ) : (
          <>
            {currentExperiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800/50 mb-4 border border-gray-200 dark:border-zinc-700">
                  {activeTab === 'my' ? <FiUser className="h-12 w-12 text-gray-400 dark:text-gray-500" /> : <FiGlobe className="h-12 w-12 text-gray-400 dark:text-gray-500" />}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{activeTab === 'my' ? 'No public experiences yet' : 'No community experiences yet'}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">{emptyMessage}</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                  {currentExperiences.map(experience => (
                    <ExperienceCard key={experience.id} experience={experience} showAuthor={activeTab === 'community'} from="explore" />
                  ))}
                </div>
                {pagination.totalPages > 1 && <div className="mt-8 flex justify-center"><Pagination currentPage={pagination.page} totalPages={pagination.totalPages} onPageChange={handlePageChange} isLoading={isLoading} /></div>}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

