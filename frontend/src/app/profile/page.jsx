import { redirect } from 'next/navigation'
import { getCurrentUser, getExperiences, getLinks, getCategoryStats } from '@/lib/server-api'
import { AppLayout } from '@/components/layout'
import ProfileContent from './ProfileContent'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  // Server-side authentication check
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin?callbackUrl=/profile')
  }

  // Fetch data on server (parallel)
  const [experiences, links] = await Promise.all([
    getExperiences(),
    getLinks(),
  ])

  const experiencesCount = experiences.length
  const linksCount = links.length
  const categoryStats = getCategoryStats(experiences)

  return (
    <AppLayout categoryStats={categoryStats} className="bg-gray-50 dark:bg-zinc-950">
      <ProfileContent user={user} experiencesCount={experiencesCount} linksCount={linksCount} />
    </AppLayout>
  )
}
