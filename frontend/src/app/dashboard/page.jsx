import { getCurrentUser, getExperiences, getLinks, getAnalytics, getCategoryStats } from '@/lib/server-api'
import { AppLayout } from '@/components/layout'
import { GroupedExperiences } from '@/components/features/experiences'
import { FiPlus, FiLink, FiActivity, FiZap, FiCalendar, FiTrendingUp } from 'react-icons/fi'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

// Quick stat card for dashboard hero section
function QuickStat({ icon: Icon, label, value, gradient }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  // Fetch all data on server (parallel)
  const [experiences, links, analytics] = await Promise.all([
    getExperiences(),
    getLinks(),
    getAnalytics(),
  ])

  // Calculate category stats
  const categoryStats = getCategoryStats(experiences)
  const topLinks = links.slice(0, 3)

  // Streak and insight data
  const streaks = analytics?.streaks || { current: 0, longest: 0 }
  const totalReflections = analytics?.reflectionsReceived || 0

  // Calculate days since last entry
  const lastExperience = experiences[0] // already sorted desc
  const daysSinceLastEntry = lastExperience
    ? Math.floor((Date.now() - new Date(lastExperience.date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  // This month's count
  const now = new Date()
  const thisMonthCount = experiences.filter(exp => {
    const d = new Date(exp.date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  }).length

  // Smart greeting based on time of day
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Contextual nudge message
  const getNudge = () => {
    if (experiences.length === 0) return "Start your journey — capture your first experience today!"
    if (daysSinceLastEntry === 0) return "You've already written today. Keep the momentum going! 🔥"
    if (daysSinceLastEntry === 1) return "Yesterday was great — keep the streak alive today!"
    if (daysSinceLastEntry >= 7) return `It's been ${daysSinceLastEntry} days. What's been on your mind?`
    if (daysSinceLastEntry >= 3) return `${daysSinceLastEntry} days since your last entry. What happened since then?`
    if (streaks.current >= 7) return `🔥 ${streaks.current}-day streak! You're on fire!`
    return "What moment stood out to you today?"
  }

  return (
    <AppLayout categoryStats={categoryStats} className="bg-gray-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {greeting}, {user.name}!
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {getNudge()}
            </p>
          </div>
          {/* New Experience button intentionally removed from dashboard header to reduce visual clutter */}
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <QuickStat
            icon={FiActivity}
            label="Total Experiences"
            value={experiences.length}
            gradient="from-purple-500 to-purple-600"
          />
          <QuickStat
            icon={FiZap}
            label={streaks.current > 0 ? `Best: ${streaks.longest}d` : 'Start a streak!'}
            value={streaks.current > 0 ? `${streaks.current}d streak` : '0d'}
            gradient="from-amber-500 to-orange-500"
          />
          <QuickStat
            icon={FiCalendar}
            label="This Month"
            value={thisMonthCount}
            gradient="from-cyan-500 to-blue-500"
          />
          <QuickStat
            icon={FiTrendingUp}
            label="Reflections Received"
            value={totalReflections}
            gradient="from-pink-500 to-rose-500"
          />
        </div>

        {/* Memory Links Preview */}
        {topLinks.length > 0 && (
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">🧠</span>
                <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Memory Links
                </h2>
              </div>
              <Link
                href="/links"
                className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {topLinks.map((link) => (
                <Link
                  key={link.id}
                  href={`/links/${link.id}`}
                  className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-all group relative overflow-hidden"
                >
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{ 
                      background: `radial-gradient(circle at 50% 50%, ${link.color}, transparent 70%)`
                    }}
                  />
                  <div
                    className="h-1 rounded-full mb-3 relative"
                    style={{ backgroundColor: link.color }}
                  >
                    <div 
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{ backgroundColor: link.color, opacity: 0.5 }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors mb-1 relative z-10">
                    {link.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 relative z-10">
                    {link._count?.experienceLinks || 0} {(link._count?.experienceLinks || 0) === 1 ? 'neuron' : 'neurons'} connected
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state prompt */}
        {topLinks.length === 0 && experiences.length >= 2 && (
          <div className="mb-8 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6 text-center">
            <span className="text-6xl block mb-3">🧠</span>
            <h3 className="text-lg font-semibold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Try Memory Links!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
              Connect related experiences to see how your memories form neural pathways
            </p>
            <Link
              href="/links/new"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 font-semibold text-white shadow-lg hover:scale-105 transition-transform"
            >
              <FiLink className="h-4 w-4" />
              Create Your First Link
            </Link>
          </div>
        )}

        {/* Grouped Experiences */}
        <GroupedExperiences experiences={experiences} from="dashboard" />
      </div>
    </AppLayout>
  )
}
