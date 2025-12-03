'use client'

import { useState, useEffect } from 'react'
import { ExperienceCard } from '@/components/features/experiences'
import { Pagination } from '@/components/common'
import { CATEGORIES, API_BASE_URL } from '@/lib/constants'
import { FiGlobe, FiFilter, FiUser } from 'react-icons/fi'

export default function ExploreContent({ initialExperiences, currentUserId }) {
  const [activeTab, setActiveTab] = useState('community') // 'community' or 'my'
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [experiences, setExperiences] = useState(Array.isArray(initialExperiences) ? initialExperiences : [])
  const [page, setPage] = useState(0)
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 20,
    total: Array.isArray(initialExperiences) ? initialExperiences.length : 0,
    totalPages: 1
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch experiences when category or page changes
  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true)
      try {
        const categoryParam = selectedCategory === 'ALL' ? '' : `&category=${selectedCategory}`
        const response = await fetch(`${API_BASE_URL}/explore?page=${page}&limit=20${categoryParam}`, {
          credentials: 'include'
        })
        const data = await response.json()
        
        if (response.ok) {
          // Handle response format - data contains { experiences, pagination }
          const experiencesArray = Array.isArray(data.experiences) ? data.experiences : (Array.isArray(data) ? data : [])
          setExperiences(experiencesArray)
          if (data.pagination) {
            setPagination(data.pagination)
          }
        }
      } catch (error) {
        console.error('Error fetching experiences:', error)
        setExperiences([]) // Set empty array on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchExperiences()
  }, [selectedCategory, page])

  // Separate experiences by tab
  const experiencesArray = Array.isArray(experiences) ? experiences : []
  const communityExperiences = experiencesArray.filter(exp => exp.userId !== currentUserId)
  const myExperiences = experiencesArray.filter(exp => exp.userId === currentUserId)

  // Get current experiences based on active tab
  const currentExperiences = activeTab === 'community' ? communityExperiences : myExperiences

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setPage(0) // Reset to first page when changing category
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
              <FiGlobe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Explore
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab === 'community' 
                  ? 'Discover experiences from the community'
                  : 'Your public experiences'}
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="mt-6 mb-6">
            <div className="inline-flex rounded-lg bg-gray-100 p-1 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700">
              <button
                onClick={() => {
                  setActiveTab('my')
                  setSelectedCategory('ALL')
                  setPage(0)
                }}
                className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all ${
                  activeTab === 'my'
                    ? 'bg-white text-purple-600 shadow-md dark:bg-zinc-900 dark:text-purple-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiUser className="h-4 w-4" />
                  My Content
                  <span className="ml-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    {myExperiences.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab('community')
                  setSelectedCategory('ALL')
                  setPage(0)
                }}
                className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all ${
                  activeTab === 'community'
                    ? 'bg-white text-purple-600 shadow-md dark:bg-zinc-900 dark:text-purple-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiGlobe className="h-4 w-4" />
                  Community
                  <span className="ml-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    {communityExperiences.length}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <FiFilter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by category
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('ALL')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 hover:border-purple-300 hover:shadow-md dark:from-purple-900/20 dark:to-pink-900/20 dark:text-purple-300 dark:border-purple-700 dark:hover:border-purple-600'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => {
                const CategoryIcon = cat.icon
                const isSelected = selectedCategory === cat.value
                
                return (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                      isSelected
                        ? `${cat.bgColor} ${cat.color} shadow-lg border-2 border-current`
                        : `${cat.bgColor} ${cat.color} hover:shadow-md hover:scale-105 border border-transparent`
                    }`}
                  >
                    <CategoryIcon className="h-4 w-4" />
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Experiences Grid */}
            {currentExperiences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800/50 mb-4 border border-gray-200 dark:border-zinc-700">
                  {activeTab === 'my' ? (
                    <FiUser className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <FiGlobe className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {activeTab === 'my' 
                    ? 'No public experiences yet'
                    : 'No community experiences yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">
                  {activeTab === 'my' 
                    ? selectedCategory === 'ALL'
                      ? "You haven't shared any public experiences yet. Create one and make it public to share with the community!"
                      : `You haven't shared any public experiences in ${CATEGORIES.find(c => c.value === selectedCategory)?.label} category yet.`
                    : selectedCategory === 'ALL'
                      ? "No public experiences from the community yet. Be the first to share!"
                      : `No public experiences in ${CATEGORIES.find(c => c.value === selectedCategory)?.label} category yet.`}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {currentExperiences.map((experience) => (
                    <ExperienceCard
                      key={experience.id}
                      experience={experience}
                      showAuthor={activeTab === 'community'}
                      from="explore"
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
