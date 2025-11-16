'use client'

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

/**
 * Pagination component with page numbers and navigation
 * @param {number} currentPage - Current page (0-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 * @param {boolean} isLoading - Show loading state
 */
export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading = false 
}) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5 // Show max 5 page numbers

  let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2))
  let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1)

  // Adjust if we're near the end
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(0, endPage - maxVisible + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || isLoading}
        className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 dark:hover:border-zinc-500"
      >
        <FiChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* First page + ellipsis if needed */}
      {startPage > 0 && (
        <>
          <button
            onClick={() => onPageChange(0)}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 dark:hover:border-zinc-500"
          >
            1
          </button>
          {startPage > 1 && (
            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          disabled={isLoading}
          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
            page === currentPage
              ? 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-500/30 dark:shadow-purple-500/20'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 dark:hover:border-zinc-500'
          }`}
        >
          {page + 1}
        </button>
      ))}

      {/* Last page + ellipsis if needed */}
      {endPage < totalPages - 1 && (
        <>
          {endPage < totalPages - 2 && (
            <span className="px-2 text-gray-500 dark:text-gray-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages - 1)}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 dark:hover:border-zinc-500"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1 || isLoading}
        className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 dark:hover:border-zinc-500"
      >
        <span className="hidden sm:inline">Next</span>
        <FiChevronRight className="h-4 w-4" />
      </button>

      {/* Page Info */}
      <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage + 1} of {totalPages}
      </span>
    </div>
  )
}
