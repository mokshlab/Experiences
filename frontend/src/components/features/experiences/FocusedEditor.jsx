'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FiSave, FiX, FiCalendar, FiTag, FiMapPin, FiSmile, FiLock, FiGlobe,
  FiAlertCircle, FiChevronDown, FiClock, FiMaximize2, FiMinimize2, 
  FiEye, FiEdit3, FiTrash2
} from 'react-icons/fi'
import { CATEGORIES, MOODS } from '@/lib/constants'
import { apiClient } from '@/lib/api-client'
import { PuzzleLoader, useToast } from '@/components/common'
import { useDropdown } from '@/hooks'
import TagInput from './TagInput'

const DRAFT_KEY = 'experience-draft'
const AUTO_SAVE_INTERVAL = 10000 // 10 seconds

// Mood-based ambient gradients
const MOOD_GRADIENTS = {
  Happy: 'from-yellow-500/5 via-amber-500/5 to-orange-500/5',
  Joyful: 'from-yellow-500/8 via-orange-500/5 to-pink-500/5',
  Excited: 'from-orange-500/8 via-red-500/5 to-pink-500/5',
  Grateful: 'from-emerald-500/5 via-teal-500/5 to-cyan-500/5',
  Proud: 'from-amber-500/5 via-yellow-500/5 to-orange-500/5',
  Inspired: 'from-violet-500/5 via-purple-500/5 to-indigo-500/5',
  Energized: 'from-red-500/5 via-orange-500/5 to-yellow-500/5',
  Loved: 'from-pink-500/8 via-rose-500/5 to-red-500/5',
  Blessed: 'from-sky-500/5 via-blue-500/5 to-indigo-500/5',
  Peaceful: 'from-cyan-500/5 via-sky-500/5 to-blue-500/5',
  Calm: 'from-teal-500/5 via-cyan-500/5 to-sky-500/5',
  Nostalgic: 'from-amber-500/5 via-orange-500/5 to-rose-500/5',
  Hopeful: 'from-green-500/5 via-emerald-500/5 to-teal-500/5',
  Curious: 'from-blue-500/5 via-indigo-500/5 to-violet-500/5',
  Surprised: 'from-pink-500/5 via-purple-500/5 to-violet-500/5',
  Content: 'from-green-500/5 via-teal-500/5 to-cyan-500/5',
  Determined: 'from-red-500/5 via-orange-500/5 to-amber-500/5',
  Overwhelmed: 'from-gray-500/5 via-slate-500/5 to-zinc-500/5',
  Anxious: 'from-purple-500/5 via-indigo-500/5 to-blue-500/5',
  Frustrated: 'from-red-500/8 via-orange-500/5 to-amber-500/5',
  Sad: 'from-blue-500/8 via-indigo-500/5 to-slate-500/5',
  Disappointed: 'from-gray-500/5 via-blue-500/5 to-indigo-500/5',
  Tired: 'from-slate-500/5 via-gray-500/5 to-zinc-500/5',
}

export default function FocusedEditor({ mode = 'create', experience = null }) {
  const router = useRouter()
  const toast = useToast()
  const textareaRef = useRef(null)
  const lastSavedRef = useRef(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const categoryDropdown = useDropdown()
  const moodDropdown = useDropdown()

  // Initial form state (from draft or experience or defaults)
  const getInitialFormData = useCallback(() => {
    // For edit mode, use experience data
    if (mode === 'edit' && experience) {
      return {
        title: experience.title,
        content: experience.content,
        date: experience.date.split('T')[0],
        time: experience.date.split('T')[1]?.substring(0, 5) || '00:00',
        category: experience.category,
        isPublic: experience.isPublic,
        tags: experience.tags || [],
        mood: experience.mood || '',
        location: experience.location || ''
      }
    }
    
    // For create mode, check for saved draft
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        try {
          const draft = JSON.parse(saved)
          // Only restore if draft is less than 24h old
          if (draft._timestamp && Date.now() - draft._timestamp < 86400000) {
            const { _timestamp, ...data } = draft
            return data
          }
        } catch {}
      }
    }

    return {
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      category: 'DAILY_JOURNAL',
      isPublic: false,
      tags: [],
      mood: '',
      location: ''
    }
  }, [mode, experience])

  const [formData, setFormData] = useState(getInitialFormData)
  const [includeTimestamp, setIncludeTimestamp] = useState(() => {
    if (mode === 'edit' && experience) {
      const timeOnly = experience.date.split('T')[1]?.substring(0, 5) || '00:00'
      return timeOnly !== '00:00'
    }
    return true
  })

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category)
  const SelectedIcon = selectedCategory?.icon || FiTag
  const selectedMood = MOODS.find(mood => mood.value === formData.mood)

  // Word and character counts
  const charCount = formData.content.length
  const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0
  const targetWords = 200
  const progress = Math.min(wordCount / targetWords, 1)

  // Auto-save draft to localStorage (create mode only)
  useEffect(() => {
    if (mode !== 'create') return

    const interval = setInterval(() => {
      const draft = { ...formData, _timestamp: Date.now() }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 2000)
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [formData, mode])

  // Track unsaved changes
  useEffect(() => {
    const initialData = getInitialFormData()
    const changed = JSON.stringify({ ...formData }) !== JSON.stringify(initialData)
    setHasUnsavedChanges(changed)
  }, [formData, getInitialFormData])

  // Warn on navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Escape to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocusMode])

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 0))

    try {
      let finalDate
      if (includeTimestamp && formData.time) {
        const localDate = new Date(`${formData.date}T${formData.time}:00`)
        finalDate = localDate.toISOString()
      } else {
        const localDate = new Date(`${formData.date}T12:00:00`)
        finalDate = localDate.toISOString()
      }

      const { time, ...submitData } = formData

      if (mode === 'edit' && experience) {
        await apiClient.experiences.update(experience.id, {
          ...submitData,
          tags: formData.tags,
          date: finalDate,
        })
        toast.success('Experience updated!')
        clearDraft()
        // Trigger server-side revalidation for the dashboard and this experience page
        try {
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paths: [`/dashboard`, `/experiences/${experience.id}`] })
          })
        } catch (e) {
          console.warn('revalidate call failed', e)
        }
        // Add a cache-busting param so the experience page fetches fresh data
        await router.push(`/experiences/${experience.id}?ts=${Date.now()}`)
      } else {
        await apiClient.experiences.create({
          ...submitData,
          tags: formData.tags,
          date: finalDate,
        })
        toast.success('Experience created!')
        clearDraft()
        // Trigger server-side revalidation for the dashboard
        try {
          await fetch('/api/revalidate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paths: ['/dashboard'] })
          })
        } catch (e) {
          console.warn('revalidate call failed', e)
        }
        // Push to dashboard with a timestamp query param to avoid cached server fetches
        await router.push(`/dashboard?ts=${Date.now()}`)
      }
    } catch (err) {
      toast.error(err.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} experience`)
      setError(err.message)
      setLoading(false)
    }
  }

  const ambientGradient = formData.mood ? MOOD_GRADIENTS[formData.mood] || '' : ''

  // Simple markdown-ish preview
  const renderPreview = (text) => {
    if (!text) return '<p class="text-gray-400 italic">Start writing to see preview...</p>'
    return text
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => `<p class="mb-3 leading-relaxed">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('')
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      isFocusMode 
        ? 'fixed inset-0 z-[100] bg-white dark:bg-zinc-950' 
        : 'bg-gray-50 dark:bg-zinc-950 py-8 pt-20 lg:pt-8'
    }`}>
      {/* Ambient mood background */}
      {ambientGradient && (
        <div className={`fixed inset-0 bg-gradient-to-br ${ambientGradient} transition-all duration-1000 pointer-events-none`} />
      )}

      <div className={`relative ${isFocusMode ? 'h-full flex flex-col' : 'container mx-auto max-w-4xl px-4'}`}>
        {/* Top Bar */}
        <div className={`flex items-center justify-between gap-3 ${
          isFocusMode 
            ? 'px-6 py-3 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm' 
            : 'mb-6'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            {!isFocusMode && (
              <Link
                href={mode === 'edit' ? `/experiences/${experience?.id}` : '/dashboard'}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FiX className="h-4 w-4" />
                Cancel
              </Link>
            )}
            
            <div className="flex items-center gap-2">
              {/* Draft saved indicator */}
              {draftSaved && (
                <span className="text-xs text-green-500 dark:text-green-400 animate-fadeIn flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Draft saved
                </span>
              )}
              {hasUnsavedChanges && !draftSaved && (
                <span className="text-xs text-amber-500 dark:text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Word count progress ring */}
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <svg width="24" height="24" viewBox="0 0 24 24" className="transform -rotate-90">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.1" />
                <circle
                  cx="12" cy="12" r="10" fill="none"
                  stroke={progress >= 1 ? '#10b981' : '#8b5cf6'}
                  strokeWidth="2"
                  strokeDasharray={`${progress * 62.83} 62.83`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span>{wordCount}w / {charCount}c</span>
            </div>

            {/* Preview toggle */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded-lg transition-colors ${
                showPreview 
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
              title={showPreview ? 'Hide preview' : 'Show preview'}
              aria-label={showPreview ? 'Hide preview' : 'Show preview'}
            >
              <FiEye className="h-4 w-4" />
            </button>

            {/* Focus mode toggle */}
            <button
              type="button"
              onClick={() => setIsFocusMode(!isFocusMode)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              title={isFocusMode ? 'Exit focus mode (Esc)' : 'Enter focus mode'}
              aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
            >
              {isFocusMode ? <FiMinimize2 className="h-4 w-4" /> : <FiMaximize2 className="h-4 w-4" />}
            </button>

            {/* Clear draft (create mode) */}
            {mode === 'create' && hasUnsavedChanges && (
              <button
                type="button"
                onClick={() => {
                  clearDraft()
                  setFormData({
                    title: '', content: '', date: new Date().toISOString().split('T')[0],
                    time: new Date().toTimeString().slice(0, 5), category: 'DAILY_JOURNAL',
                    isPublic: false, tags: [], mood: '', location: ''
                  })
                  toast.success('Draft cleared')
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Clear draft"
                aria-label="Clear draft"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className={`${isFocusMode ? 'flex-1 overflow-y-auto' : ''}`}>
          <div className={`${isFocusMode ? 'max-w-4xl mx-auto px-6 py-8' : ''}`}>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 mb-6" role="alert">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className={`rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden ${
              isFocusMode ? 'border-0 shadow-none bg-transparent dark:bg-transparent' : 'p-6'
            }`}>
              {/* Title — large and elegant */}
              <div className={`mb-6 ${isFocusMode ? '' : ''}`}>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full bg-transparent border-0 px-0 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-0 ${
                    isFocusMode 
                      ? 'text-4xl font-bold' 
                      : 'text-2xl font-bold border-b border-gray-100 dark:border-zinc-800 pb-4'
                  }`}
                  placeholder="Title your experience..."
                  aria-label="Experience title"
                />
              </div>

              {/* Content area — editor and optional preview */}
              <div className={`${showPreview ? 'grid grid-cols-2 gap-6' : ''}`}>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className={`w-full bg-transparent border-0 px-0 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-0 resize-none leading-relaxed ${
                      isFocusMode ? 'text-lg min-h-[60vh]' : 'text-base min-h-[300px]'
                    }`}
                    placeholder="Start writing your experience..."
                    aria-label="Experience content"
                  />
                </div>

                {showPreview && (
                  <div className={`border-l border-gray-200 dark:border-zinc-700 pl-6 ${
                    isFocusMode ? 'min-h-[60vh]' : 'min-h-[300px]'
                  }`}>
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                      Preview
                    </p>
                    <div
                      className="prose prose-gray dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                      dangerouslySetInnerHTML={{ __html: renderPreview(formData.content) }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Panel — collapsible in focus mode */}
            <div className={`mt-6 space-y-4 ${isFocusMode ? 'border-t border-gray-200 dark:border-zinc-800 pt-6' : ''}`}>
              <div className="rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                {/* Date & Time */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FiCalendar className="h-4 w-4" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      aria-label="Experience date"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center justify-between text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <span className="flex items-center gap-2">
                        <FiClock className="h-4 w-4" />
                        Time
                      </span>
                      <button
                        type="button"
                        onClick={() => setIncludeTimestamp(!includeTimestamp)}
                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
                        aria-label={includeTimestamp ? 'Remove timestamp' : 'Add timestamp'}
                      >
                        {includeTimestamp ? (
                          <>
                            <FiX className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-red-600 dark:text-red-400">Remove</span>
                          </>
                        ) : (
                          <>
                            <FiClock className="h-3.5 w-3.5 text-purple-500" />
                            <span className="text-purple-600 dark:text-purple-400">Add</span>
                          </>
                        )}
                      </button>
                    </label>
                    {includeTimestamp ? (
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        aria-label="Experience time"
                      />
                    ) : (
                      <div className="w-full rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900 px-4 py-3 text-center text-sm text-gray-400 dark:text-gray-500">
                        No timestamp
                      </div>
                    )}
                  </div>
                </div>

                {/* Category & Mood */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
                  <div ref={categoryDropdown.dropdownRef}>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FiTag className="h-4 w-4" />
                      Category *
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={categoryDropdown.toggle}
                        className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-left text-gray-900 dark:text-white hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                        aria-label="Select category"
                        aria-expanded={categoryDropdown.isOpen}
                      >
                        <div className="flex items-center gap-3">
                          <SelectedIcon className={`h-5 w-5 ${selectedCategory?.color || 'text-gray-600'}`} />
                          <span className="font-medium">{selectedCategory?.label || 'Select category'}</span>
                        </div>
                        <FiChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${categoryDropdown.isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {categoryDropdown.isOpen && (
                        <div className="absolute z-50 mt-2 w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl max-h-80 overflow-y-auto" role="listbox">
                          <div className="p-2">
                            {CATEGORIES.map((category) => {
                              const Icon = category.icon
                              return (
                                <button
                                  key={category.value}
                                  type="button"
                                  role="option"
                                  aria-selected={formData.category === category.value}
                                  onClick={() => {
                                    setFormData({ ...formData, category: category.value })
                                    categoryDropdown.close()
                                  }}
                                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                                    formData.category === category.value
                                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                      : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
                                  }`}
                                >
                                  <Icon className={`h-5 w-5 ${category.color}`} />
                                  <span className="font-medium">{category.label}</span>
                                  {formData.category === category.value && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-purple-600" />
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div ref={moodDropdown.dropdownRef}>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FiSmile className="h-4 w-4" />
                      Mood
                    </label>
                    <button
                      type="button"
                      onClick={moodDropdown.toggle}
                      className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-left text-gray-900 dark:text-white hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                      aria-label="Select mood"
                      aria-expanded={moodDropdown.isOpen}
                    >
                      <span className="flex items-center gap-2">
                        {selectedMood ? (
                          <>
                            <span className="text-xl">{selectedMood.emoji}</span>
                            <span className="font-medium">{selectedMood.label}</span>
                          </>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">Select your mood</span>
                        )}
                      </span>
                      <FiChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${moodDropdown.isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {moodDropdown.isOpen && (
                      <div className="absolute z-50 mt-2 w-full max-w-md rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl max-h-80 overflow-y-auto" role="listbox">
                        <div className="p-2">
                          {MOODS.map((mood) => (
                            <button
                              key={mood.value}
                              type="button"
                              role="option"
                              aria-selected={formData.mood === mood.value}
                              onClick={() => {
                                setFormData({ ...formData, mood: mood.value })
                                moodDropdown.close()
                              }}
                              className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                                formData.mood === mood.value
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                                  : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <span className="text-xl">{mood.emoji}</span>
                              <span className="font-medium">{mood.label}</span>
                              {formData.mood === mood.value && (
                                <div className="ml-auto h-2 w-2 rounded-full bg-purple-600" />
                              )}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, mood: '' })
                              moodDropdown.close()
                            }}
                            className="w-full border-t border-gray-200 dark:border-zinc-700 px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800"
                          >
                            Clear mood
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location & Tags */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-6">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <FiMapPin className="h-4 w-4" />
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      placeholder="Where did this happen?"
                      aria-label="Location"
                    />
                  </div>

                  <TagInput
                    tags={formData.tags}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                    content={formData.content}
                  />
                </div>

                {/* Visibility */}
                <div className="rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 p-6">
                  <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Who can see this experience?
                  </h3>
                  <div className="flex gap-3">
                    <label className={`flex-1 flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                      !formData.isPublic 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                        : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                    }`}>
                      <input
                        type="radio"
                        name="visibility"
                        checked={!formData.isPublic}
                        onChange={() => setFormData({ ...formData, isPublic: false })}
                        className="sr-only"
                      />
                      <FiLock className={`h-5 w-5 ${!formData.isPublic ? 'text-purple-600' : 'text-gray-400'}`} />
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">Private</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Only you</p>
                      </div>
                    </label>

                    <label className={`flex-1 flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-all ${
                      formData.isPublic 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                        : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                    }`}>
                      <input
                        type="radio"
                        name="visibility"
                        checked={formData.isPublic}
                        onChange={() => setFormData({ ...formData, isPublic: true })}
                        className="sr-only"
                      />
                      <FiGlobe className={`h-5 w-5 ${formData.isPublic ? 'text-purple-600' : 'text-gray-400'}`} />
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">Public</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Community</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className={`flex items-center justify-end gap-4 mt-6 ${isFocusMode ? 'pb-8' : ''}`}>
              <Link
                href={mode === 'edit' ? `/experiences/${experience?.id}` : '/dashboard'}
                className="rounded-lg border border-gray-300 dark:border-zinc-700 px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label={mode === 'edit' ? 'Save changes' : 'Save experience'}
              >
                <FiSave className="h-5 w-5" />
                {loading ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Save Experience'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="text-center">
            <PuzzleLoader />
            <p className="mt-6 text-xl font-bold text-white animate-pulse drop-shadow-lg">
              {mode === 'edit' ? 'Saving changes...' : 'Saving your experience...'}
            </p>
            <p className="mt-2 text-sm text-gray-300">Please wait</p>
          </div>
        </div>
      )}
    </div>
  )
}
