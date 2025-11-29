import { redirect } from 'next/navigation'
import { getCurrentUser, getExperience } from '@/lib/server-api'
import { ExperienceView } from '@/components/features/experiences'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ExperiencePage({ params, searchParams }) {
  const { id } = await params
  
  // Check authentication first
  const user = await getCurrentUser()
  
  // Redirect if not authenticated, save callback URL to return after signin
  if (!user) {
    redirect(`/auth/signin?callbackUrl=/experiences/${id}`)
  }

  // Now fetch experience (user is authenticated)
  const experience = await getExperience(id)

  // Show not found if experience doesn't exist
  if (!experience) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Experience Not Found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The experience you're looking for doesn't exist.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = experience.userId === user.id
  
  // Get 'from' parameter from searchParams
  const resolvedSearchParams = await searchParams
  const from = resolvedSearchParams?.from || 'dashboard'

  return (
    <ExperienceView 
      experience={experience} 
      isOwner={isOwner} 
      currentUserId={user.id}
      from={from}
    />
  )
}
