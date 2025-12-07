'use client'

import { use, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { PuzzleLoader } from '@/components/common'
import { LinkForm } from '@/components/features/links'

export default function EditLinkPage({ params }) {
  // Unwrap params Promise
  const resolvedParams = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [link, setLink] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && resolvedParams?.id) {
      fetchLink()
    }
  }, [user, resolvedParams?.id])

  const fetchLink = async () => {
    try {
      const linkId = resolvedParams.id
      const linkData = await apiClient.links.getById(linkId)

      if (!linkData) {
        setNotFound(true)
        return
      }

      // Security check: ensure user owns this link
      if (linkData.userId !== user.id) {
        router.push('/links')
        return
      }

      setLink(linkData)
    } catch (error) {
      console.error('Failed to fetch link:', error)
      if (error.status === 404) {
        setNotFound(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return <PuzzleLoader />
  }

  if (!user) {
    return null
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pt-20 lg:pt-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Link Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">This neural pathway doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => router.push('/links')}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            ← Back to Neural Pathways
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pt-20 lg:pt-0">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-4xl">🧠</span>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Edit Memory Link
          </h1>
        </div>
        <LinkForm link={link} />
      </div>
    </div>
  )
}
