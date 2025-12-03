import { getCurrentUser, getExperiences, getPublicExperiences, getCategoryStats } from '@/lib/server-api'
import { AppLayout } from '@/components/layout'
import { ExploreContent } from '@/components/features/explore'

export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
  // Explore is public — works with or without auth
  const user = await getCurrentUser()

  // Fetch public experiences always; fetch user experiences only if logged in
  const [publicExperiences, userExperiences] = await Promise.all([
    getPublicExperiences(),
    user ? getExperiences() : Promise.resolve([]),
  ])

  // Calculate category stats from user's own experiences (if logged in)
  const categoryStats = user ? getCategoryStats(userExperiences) : []

  return (
    <AppLayout categoryStats={categoryStats} className="bg-gray-50 dark:bg-zinc-950">
      <ExploreContent 
        initialExperiences={publicExperiences} 
        currentUserId={user?.id || null}
      />
    </AppLayout>
  )
}
