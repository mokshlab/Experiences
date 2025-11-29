"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { FocusedEditor } from '@/components/features/experiences'
import { PuzzleLoader } from '@/components/common'

export default function EditExperiencePage({ params }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [experience, setExperience] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function fetchExperience() {
      try {
        const id = (await params).id
        const data = await apiClient.experiences.getById(id)
        
        // Check if user is the owner
        if (data.userId !== user.id) {
          setError('You do not have permission to edit this experience')
          return
        }
        
        setExperience(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchExperience()
    }
  }, [user, params])

  if (authLoading || loading) {
    return <PuzzleLoader />
  }

  if (error || !experience) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {error ? 'Access Denied' : 'Experience Not Found'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error || "The experience you're trying to edit doesn't exist."}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <FocusedEditor mode="edit" experience={experience} />
}
