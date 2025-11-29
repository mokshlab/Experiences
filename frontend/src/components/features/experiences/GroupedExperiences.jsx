'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ExperienceCard } from './'
import { FiChevronDown, FiChevronRight, FiCalendar, FiX, FiPlus, FiFeather, FiBookOpen, FiCompass } from 'react-icons/fi'
import { formatDate } from '@/utils'

export default function GroupedExperiences({ experiences, from = 'dashboard' }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Filter experiences based on search and date range
  const filteredExperiences = useMemo(() => {
    return experiences.filter(exp => {
      // Text search filter
      const matchesSearch = searchQuery === '' || 
        exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.content.toLowerCase().includes(searchQuery.toLowerCase())

      // Date range filter
      const expDate = new Date(exp.date)
      const startDate = dateRange.start ? new Date(dateRange.start) : null
      const endDate = dateRange.end ? new Date(dateRange.end) : null

      let matchesDateRange = true
      if (startDate && endDate) {
        matchesDateRange = expDate >= startDate && expDate <= endDate
      } else if (startDate) {
        matchesDateRange = expDate >= startDate
      } else if (endDate) {
        matchesDateRange = expDate <= endDate
      }

      return matchesSearch && matchesDateRange
    })
  }, [experiences, searchQuery, dateRange])

  // Group filtered experiences by date
  const groupedByDate = useMemo(() => {
    return filteredExperiences.reduce((groups, experience) => {
      const date = formatDate(experience.date, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(experience)
      return groups
    }, {})
  }, [filteredExperiences])

  // State to track which date groups are expanded
  const [expandedDates, setExpandedDates] = useState(() => {
    // All dates expanded by default
    return Object.keys(groupedByDate).reduce((acc, date) => {
      acc[date] = true
      return acc
    }, {})
  })

  const toggleDate = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setDateRange({ start: '', end: '' })
  }

  const hasActiveFilters = searchQuery || dateRange.start || dateRange.end

  // Zero experiences — show a first-time welcome empty state
  if (experiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-10 sm:p-16 text-center dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 relative overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute inset-0 overflow-hidden opacity-15 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <span className="text-6xl sm:text-7xl block mb-5 animate-bounce">📝</span>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
            Your Journey Starts Here
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto text-base sm:text-lg leading-relaxed">
            Capture your first experience — a milestone, a lesson, a moment that matters. Your story deserves to be remembered.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-purple-500/20">
              <FiFeather className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Write</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Capture moments & lessons</div>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-pink-500/20">
              <FiBookOpen className="h-6 w-6 text-pink-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Reflect</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Get community reflections</div>
            </div>
            <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-cyan-500/20">
              <FiCompass className="h-6 w-6 text-cyan-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Grow</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track patterns & progress</div>
            </div>
          </div>

          <Link
            href="/experiences/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 sm:px-8 py-3 sm:py-4 font-semibold text-white shadow-lg hover:scale-105 transition-transform text-base sm:text-lg"
          >
            <FiPlus className="h-5 w-5" />
            Write Your First Experience
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
        <div className="flex flex-wrap gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="flex gap-2 items-center">
            <FiCalendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
            <span className="text-gray-500 dark:text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
            >
              <FiX className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grouped Experiences */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-12 text-center dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
          <div className="mb-4 text-6xl">🔍</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            No matches found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No experiences match your current filters
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            <FiX className="h-4 w-4" />
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByDate).map(([date, dateExperiences]) => (
            <div key={date} className="space-y-4">
              {/* Date Header */}
              <button
                onClick={() => toggleDate(date)}
                className="flex w-full items-center gap-3 rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {expandedDates[date] ? (
                    <FiChevronDown className="h-5 w-5" />
                  ) : (
                    <FiChevronRight className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {date}
                  </h2>
                </div>
                <div className="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                  {dateExperiences.length}
                </div>
              </button>

              {/* Experiences Grid */}
              {expandedDates[date] && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pl-4 animate-fadeIn">
                  {dateExperiences.map((experience) => (
                    <ExperienceCard key={experience.id} experience={experience} from={from} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
