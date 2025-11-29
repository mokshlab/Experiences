'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ExperienceError({ error, reset }) {
  useEffect(() => {
    console.error('Experience detail error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="text-6xl mb-4">🧩</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Experience Error
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error.message === 'Unauthorized' 
              ? 'Please sign in to view this experience' 
              : 'Failed to load experience details'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {error.message === 'Unauthorized' ? (
            <Link
              href="/auth/signin"
              className="rounded-lg bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 transition-colors"
            >
              Sign In
            </Link>
          ) : (
            <button
              onClick={reset}
              className="rounded-lg bg-purple-600 px-6 py-3 text-white font-medium hover:bg-purple-700 transition-colors"
            >
              Try again
            </button>
          )}
          <Link
            href="/dashboard"
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
