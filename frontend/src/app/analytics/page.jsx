import { redirect } from 'next/navigation'
import { getCurrentUser, getAnalytics, getExperiences, getCategoryStats } from '@/lib/server-api'
import { AppLayout } from '@/components/layout'
import AnalyticsCharts from './AnalyticsCharts'
import { FiBarChart2 } from 'react-icons/fi'
import PageHeader from '@/components/layout/PageHeader'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/signin?callbackUrl=/analytics')
  }

  // Parallel server-side fetching
  const [analytics, experiences] = await Promise.all([
    getAnalytics(),
    getExperiences(),
  ])

  const categoryStats = getCategoryStats(experiences)

  return (
    <AppLayout categoryStats={categoryStats} className="bg-gray-50 dark:bg-zinc-950">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <PageHeader icon={<FiBarChart2 className="h-5 w-5" />} title="Analytics" subtitle="Your journey, visualized" />

        {/* Charts */}
        <AnalyticsCharts analytics={analytics} />
      </div>
    </AppLayout>
  )
}
