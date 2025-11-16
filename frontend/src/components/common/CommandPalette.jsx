'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch, FiX, FiFileText, FiLink, FiPlus, FiBarChart2, FiUser, FiGlobe, FiCommand } from 'react-icons/fi'
import { apiClient } from '@/lib/api-client'
import { CATEGORY_CONFIG, MOOD_EMOJIS } from '@/lib/constants'

// Quick actions always available
const QUICK_ACTIONS = [
  { id: 'new-experience', label: 'New Experience', icon: FiPlus, href: '/experiences/new', type: 'action' },
  { id: 'new-link', label: 'New Neural Link', icon: FiLink, href: '/links/new', type: 'action' },
  { id: 'dashboard', label: 'Go to Dashboard', icon: FiFileText, href: '/dashboard', type: 'action' },
  { id: 'analytics', label: 'View Analytics', icon: FiBarChart2, href: '/analytics', type: 'action' },
  { id: 'explore', label: 'Explore Public', icon: FiGlobe, href: '/explore', type: 'action' },
  { id: 'profile', label: 'Profile', icon: FiUser, href: '/profile', type: 'action' },
]

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [experiences, setExperiences] = useState([])
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const router = useRouter()

  // Load data when palette opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      Promise.all([
        apiClient.experiences.getAll().catch(() => []),
        apiClient.links.getAll().catch(() => []),
      ]).then(([exps, lnks]) => {
        setExperiences(exps || [])
        setLinks(lnks || [])
        setLoading(false)
      })
    } else {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Filter results
  const lowerQuery = query.toLowerCase().trim()

  const filteredExperiences = lowerQuery
    ? experiences.filter(exp =>
        exp.title.toLowerCase().includes(lowerQuery) ||
        exp.content.toLowerCase().includes(lowerQuery) ||
        (exp.tags && exp.tags.some(t => t.toLowerCase().includes(lowerQuery))) ||
        (exp.location && exp.location.toLowerCase().includes(lowerQuery)) ||
        (exp.category && (CATEGORY_CONFIG[exp.category]?.label || '').toLowerCase().includes(lowerQuery))
      ).slice(0, 5)
    : experiences.slice(0, 3)

  const filteredLinks = lowerQuery
    ? links.filter(link =>
        link.name.toLowerCase().includes(lowerQuery) ||
        (link.description && link.description.toLowerCase().includes(lowerQuery))
      ).slice(0, 3)
    : links.slice(0, 2)

  const filteredActions = lowerQuery
    ? QUICK_ACTIONS.filter(a => a.label.toLowerCase().includes(lowerQuery))
    : QUICK_ACTIONS

  // Build flat results list
  const results = [
    ...filteredActions.map(a => ({ ...a, section: 'Actions' })),
    ...filteredExperiences.map(exp => ({
      id: `exp-${exp.id}`,
      label: exp.title,
      sub: exp.category ? (CATEGORY_CONFIG[exp.category]?.label || exp.category) : '',
      icon: FiFileText,
      href: `/experiences/${exp.id}`,
      type: 'experience',
      mood: exp.mood,
      section: 'Experiences',
    })),
    ...filteredLinks.map(link => ({
      id: `link-${link.id}`,
      label: link.name,
      sub: `${link._count?.experienceLinks || 0} connected`,
      icon: FiLink,
      href: `/links/${link.id}`,
      type: 'link',
      color: link.color,
      section: 'Neural Links',
    })),
  ]

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle navigation
  const navigate = useCallback((item) => {
    setIsOpen(false)
    router.push(item.href)
  }, [router])

  // Handle key navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault()
      navigate(results[selectedIndex])
    }
  }

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  if (!isOpen) return null

  // Group results by section
  const sections = results.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = []
    acc[item.section].push(item)
    return acc
  }, {})

  let flatIndex = -1

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden animate-in zoom-in-95 slide-in-from-top-2 duration-200">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-zinc-800">
          <FiSearch className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search experiences, links, or jump to..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-base focus:outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 rounded-md border border-gray-200 dark:border-zinc-700 px-2 py-0.5 text-xs text-gray-400">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">No results for "{query}"</p>
            </div>
          ) : (
            Object.entries(sections).map(([section, items]) => (
              <div key={section}>
                <div className="px-5 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {section}
                  </span>
                </div>
                {items.map((item) => {
                  flatIndex++
                  const idx = flatIndex
                  const isSelected = idx === selectedIndex
                  const ItemIcon = item.icon
                  const moodEmoji = item.mood ? MOOD_EMOJIS[item.mood] : null

                  return (
                    <button
                      key={item.id}
                      data-index={idx}
                      onClick={() => navigate(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${
                        item.type === 'action'
                          ? 'bg-gray-100 dark:bg-zinc-800'
                          : item.type === 'link'
                          ? 'bg-pink-50 dark:bg-pink-900/20'
                          : 'bg-purple-50 dark:bg-purple-900/20'
                      }`}>
                        {item.color ? (
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                        ) : moodEmoji ? (
                          <span className="text-sm">{moodEmoji}</span>
                        ) : (
                          <ItemIcon className={`h-4 w-4 ${
                            isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'
                        }`}>
                          {item.label}
                        </p>
                        {item.sub && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.sub}</p>
                        )}
                      </div>
                      {isSelected && (
                        <span className="text-xs text-purple-500 dark:text-purple-400 flex-shrink-0">↵</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-5 py-3 border-t border-gray-200 dark:border-zinc-800 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-[10px]">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-[10px]">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700 text-[10px]">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  )
}
