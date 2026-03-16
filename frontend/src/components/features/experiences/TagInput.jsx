'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { FiTag, FiX } from 'react-icons/fi'

const TAG_COLORS = [
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
]

function getTagColor(tag) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

// Simple keyword extraction from content for suggestions
function extractKeywords(content) {
  if (!content || content.length < 20) return []
  
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'this', 'that', 'these',
    'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she',
    'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
    'when', 'where', 'why', 'how', 'not', 'no', 'nor', 'so', 'if', 'then',
    'than', 'too', 'very', 'just', 'about', 'up', 'out', 'all', 'also',
    'from', 'into', 'over', 'after', 'before', 'between', 'under', 'again',
    'some', 'such', 'only', 'same', 'other', 'new', 'one', 'two', 'like',
    'more', 'most', 'much', 'many', 'really', 'felt', 'feel', 'got', 'get',
    'went', 'going', 'think', 'made', 'make', 'come', 'back', 'even', 'still',
    'well', 'way', 'day', 'time', 'know', 'take', 'thing', 'things', 'don',
  ])

  const words = content.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
  const freq = {}
  words.forEach(w => {
    if (!stopWords.has(w)) {
      freq[w] = (freq[w] || 0) + 1
    }
  })

  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word)
}

export default function TagInput({ tags, onChange, content = '', existingTags = [] }) {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Get all available tags for autocomplete (from localStorage history)
  const [tagHistory, setTagHistory] = useState([])
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tag-history')
      if (saved) setTagHistory(JSON.parse(saved))
    } catch {}
  }, [])

  // Save tag to history
  const saveToHistory = (tag) => {
    const updated = [...new Set([tag, ...tagHistory])].slice(0, 50)
    setTagHistory(updated)
    localStorage.setItem('tag-history', JSON.stringify(updated))
  }

  // Content-based suggestions
  const contentSuggestions = useMemo(() => extractKeywords(content), [content])

  // Combined suggestions: filter by input, exclude already added
  const suggestions = useMemo(() => {
    const tagsLower = new Set(tags.map(t => t.toLowerCase()))
    const query = inputValue.toLowerCase().trim()
    
    // Combine history and content suggestions
    const allSuggestions = [...new Set([...tagHistory, ...existingTags, ...contentSuggestions])]
      .filter(s => !tagsLower.has(s.toLowerCase()))
    
    if (!query) {
      // Show content suggestions when empty
      return contentSuggestions
        .filter(s => !tagsLower.has(s))
        .slice(0, 5)
        .map(s => ({ value: s, source: 'suggested' }))
    }

    return allSuggestions
      .filter(s => s.toLowerCase().includes(query) && s.toLowerCase() !== query)
      .slice(0, 6)
      .map(s => ({ value: s, source: tagHistory.includes(s) ? 'history' : 'suggested' }))
  }, [inputValue, tags, tagHistory, existingTags, contentSuggestions])

  const addTag = (tag) => {
    const trimmed = tag.trim().toLowerCase()
    if (!trimmed) return
    if (tags.some(t => t.toLowerCase() === trimmed)) return
    
    onChange([...tags, trimmed])
    saveToHistory(trimmed)
    setInputValue('')
    setSelectedSuggestionIndex(-1)
  }

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        addTag(suggestions[selectedSuggestionIndex].value)
      } else if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedSuggestionIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  const showSuggestions = isFocused && suggestions.length > 0

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <FiTag className="h-4 w-4" />
        Tags
      </label>
      
      <div
        className={`flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2 min-h-[48px] cursor-text transition-all ${
          isFocused
            ? 'border-purple-500 ring-2 ring-purple-500/20'
            : 'border-gray-300 dark:border-zinc-700'
        } bg-white dark:bg-zinc-800`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Tag pills */}
        {tags.map((tag, index) => {
          const color = getTagColor(tag)
          return (
            <span
              key={index}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium border ${color.bg} ${color.text} ${color.border} animate-fadeIn`}
            >
              #{tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(index)
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-slate-700/40 transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          )
        })}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setSelectedSuggestionIndex(-1)
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setIsFocused(false), 200)
          }}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[80px] bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
          placeholder={tags.length === 0 ? 'Type and press Enter to add tags...' : 'Add more...'}
          aria-label="Add tag"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.value}
              type="button"
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                index === selectedSuggestionIndex
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => addTag(suggestion.value)}
            >
              <span className="font-medium">#{suggestion.value}</span>
              {suggestion.source === 'suggested' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium">
                  suggested
                </span>
              )}
              {suggestion.source === 'history' && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 font-medium">
                  recent
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content suggestions hint */}
      {!isFocused && tags.length === 0 && contentSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-1">Suggested:</span>
          {contentSuggestions.slice(0, 3).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="text-[10px] px-2 py-0.5 rounded-full border border-dashed border-gray-300 dark:border-zinc-700 text-gray-500 dark:text-gray-400 hover:border-purple-400 hover:text-purple-500 dark:hover:border-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              +{s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
