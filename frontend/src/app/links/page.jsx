import { redirect } from 'next/navigation'
import { getCurrentUser, getLinks, getCategoryStats, getExperiences } from '@/lib/server-api'
import { AppLayout } from '@/components/layout'
import LinksPageClient from './LinksPageClient'

export const dynamic = 'force-dynamic'

export default async function LinksPage() {
  // Server-side authentication check
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/auth/signin?callbackUrl=/links')
  }

  // Fetch data on server (parallel)
  const [links, experiences] = await Promise.all([
    getLinks(),
    getExperiences(),
  ])

  // Calculate category stats for sidebar
  const categoryStats = getCategoryStats(experiences)

  return (
    <AppLayout categoryStats={categoryStats} className="bg-gray-50 dark:bg-zinc-950">
      <LinksPageClient links={links} />
    </AppLayout>
  )
}
