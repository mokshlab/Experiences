import { redirect } from 'next/navigation'
import { getCurrentUser, getLink, getExperiences, getCategoryStats } from '@/lib/server-api'
import { LinkTimeline } from '@/components/features/links'
import { AppLayout } from '@/components/layout'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LinkDetailPage({ params }) {
  const { id } = await params
  
  // Check authentication first
  const user = await getCurrentUser()
  
  // Redirect if not authenticated, save callback URL to return after signin
  if (!user) {
    redirect(`/auth/signin?callbackUrl=/links/${id}`)
  }

  // Now fetch data (user is authenticated) - parallel fetch for performance
  const [link, allExperiences] = await Promise.all([
    getLink(id),
    getExperiences()
  ])

  // Calculate category stats for sidebar
  const categoryStats = getCategoryStats(allExperiences)

  // Show not found if link doesn't exist
  if (!link) {
    return (
      <AppLayout categoryStats={categoryStats}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Link Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This neural pathway doesn't exist or you don't have access to it.
          </p>
          <Link
            href="/links"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            ← Back to Neural Pathways
          </Link>
        </div>
      </AppLayout>
    )
  }

  // Filter out experiences already in this link
  const linkedExperienceIds = new Set(
    link.experienceLinks?.map(el => el.experienceId) || []
  )
  const availableExperiences = allExperiences.filter(
    exp => !linkedExperienceIds.has(exp.id)
  )

  return (
    <AppLayout categoryStats={categoryStats}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <LinkTimeline 
          link={link} 
          availableExperiences={availableExperiences}
        />
      </div>
    </AppLayout>
  )
}
