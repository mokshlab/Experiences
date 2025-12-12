import { redirect } from 'next/navigation'
import { getCurrentUser, getAnalytics, getExperiences, getCategoryStats } from '@/lib/server-api'
import { AppLayout } from '@/components/layout'
import AnalyticsCharts from './AnalyticsCharts'
import { FiBarChart2 } from 'react-icons/fi'

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FiBarChart2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Analytics
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your journey, visualized
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <AnalyticsCharts analytics={analytics} />
      </div>
    </AppLayout>
  )
}
