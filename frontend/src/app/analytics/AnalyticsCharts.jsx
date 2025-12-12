'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts'
import { CATEGORY_CONFIG, MOODS } from '@/lib/constants'
import {
  FiActivity, FiTrendingUp, FiCalendar, FiZap, FiTag, FiMessageCircle,
  FiEye, FiLock, FiLink, FiAward, FiPlus, FiStar
} from 'react-icons/fi'

const CHART_COLORS = [
  '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981',
  '#6366f1', '#ef4444', '#14b8a6', '#f97316', '#84cc16',
  '#a855f7', '#e879f9', '#22d3ee', '#fbbf24', '#34d399', '#818cf8'
]

const MOOD_EMOJIS = MOODS.reduce((acc, m) => { acc[m.value] = m.emoji; return acc }, {})

function StatCard({ icon: Icon, label, value, sub, color = 'purple' }) {
  const colors = {
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    cyan: 'from-cyan-500 to-cyan-600',
    green: 'from-green-500 to-green-600',
    amber: 'from-amber-500 to-amber-600',
    blue: 'from-blue-500 to-blue-600',
  }
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center flex-shrink-0`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-10 sm:p-16 text-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10">
        <span className="text-6xl sm:text-7xl block mb-5"></span>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent mb-3">
          No Data Yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8 text-base sm:text-lg leading-relaxed">
          Start logging experiences to see your analytics come to life.
        </p>
        <Link
          href="/experiences/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg hover:scale-105 transition-transform"
        >
          <FiPlus className="h-5 w-5" />
          Write Your First Experience
        </Link>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-gray-900 dark:text-white">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs text-gray-600 dark:text-gray-300">
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// Contribution heatmap
function ContributionHeatmap({ dailyActivity }) {
  const { weeks, monthLabels, maxCount, totalDays } = useMemo(() => {
    const today = new Date()
    const weeks = []
    let currentWeek = []
    const monthLabels = []
    let maxCount = 0
    let totalDays = 0

    // Go back 365 days
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 364)

    // Align to start of week (Sunday)
    const dayOfWeek = startDate.getDay()
    startDate.setDate(startDate.getDate() - dayOfWeek)

    let lastMonth = -1
    const current = new Date(startDate)

    while (current <= today) {
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`
      const count = dailyActivity[dateStr] || 0
      if (count > maxCount) maxCount = count
      if (count > 0) totalDays++

      // Track month labels
      if (current.getMonth() !== lastMonth && current.getDay() === 0) {
        monthLabels.push({
          label: current.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex: weeks.length
        })
        lastMonth = current.getMonth()
      }

      currentWeek.push({ date: dateStr, count, dayOfWeek: current.getDay() })

      if (current.getDay() === 6) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      current.setDate(current.getDate() + 1)
    }
    if (currentWeek.length > 0) weeks.push(currentWeek)

    return { weeks, monthLabels, maxCount, totalDays }
  }, [dailyActivity])

  const getColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-zinc-800'
    const intensity = Math.min(count / Math.max(maxCount, 1), 1)
    if (intensity <= 0.25) return 'bg-purple-200 dark:bg-purple-900/60'
    if (intensity <= 0.5) return 'bg-purple-400 dark:bg-purple-700'
    if (intensity <= 0.75) return 'bg-purple-500 dark:bg-purple-500'
    return 'bg-purple-700 dark:bg-purple-400'
  }

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', '']

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FiCalendar className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Writing Activity</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-purple-600 dark:text-purple-400">{totalDays}</span> active days in the last year
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0.5 min-w-fit">
          {/* Month labels */}
          <div className="flex gap-0.5 ml-8 mb-1">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="text-[10px] text-gray-400 dark:text-gray-500"
                style={{ position: 'relative', left: `${m.weekIndex * 14}px` }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-[12px] w-6 text-[9px] text-gray-400 dark:text-gray-500 flex items-center justify-end pr-1">
                  {label}
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`w-[12px] h-[12px] rounded-[2px] ${getColor(day.count)} transition-colors`}
                    title={`${day.date}: ${day.count} experience${day.count !== 1 ? 's' : ''}`}
                    role="img"
                    aria-label={`${day.date}: ${day.count} experiences`}
                  />
                ))}
                {/* Fill empty days at end of last week */}
                {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-[12px] h-[12px]" />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 ml-8">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">Less</span>
            <div className="w-[12px] h-[12px] rounded-[2px] bg-gray-100 dark:bg-zinc-800" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-purple-200 dark:bg-purple-900/60" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-purple-400 dark:bg-purple-700" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-purple-500 dark:bg-purple-500" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-purple-700 dark:bg-purple-400" />
            <span className="text-[10px] text-gray-400 dark:text-gray-500">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Year in review
function YearInReview({ analytics }) {
  const { overview, categoryDistribution, moodDistribution, streaks, topTags, weekdayDistribution, firstExperienceDate } = analytics
  
  const topCategory = categoryDistribution[0]
  const topMood = moodDistribution[0]
  const topTag = topTags[0]
  const mostActiveDay = weekdayDistribution?.reduce((best, d) => d.count > best.count ? d : best, weekdayDistribution[0])
  
  // Avg per month
  const monthsActive = firstExperienceDate
    ? Math.max(1, Math.ceil((Date.now() - new Date(firstExperienceDate).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : 1
  const avgPerMonth = (overview.totalExperiences / monthsActive).toFixed(1)

  return (
    <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-6 sm:p-8 overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <FiStar className="h-6 w-6" />
          <h3 className="text-xl sm:text-2xl font-bold">Your Year in Review</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <p className="text-3xl sm:text-4xl font-black">{overview.totalExperiences}</p>
            <p className="text-white/70 text-sm mt-1">experiences captured</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black">{avgPerMonth}</p>
            <p className="text-white/70 text-sm mt-1">avg per month</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black">{streaks.longest}d</p>
            <p className="text-white/70 text-sm mt-1">longest streak</p>
          </div>
          {topCategory && (
            <div>
              <p className="text-lg sm:text-xl font-bold">{CATEGORY_CONFIG[topCategory.category]?.label || topCategory.category}</p>
              <p className="text-white/70 text-sm mt-1">favorite category ({topCategory.count}x)</p>
            </div>
          )}
          {topMood && (
            <div>
              <p className="text-lg sm:text-xl font-bold">{MOOD_EMOJIS[topMood.mood] || ''} {topMood.mood}</p>
              <p className="text-white/70 text-sm mt-1">dominant mood ({topMood.count}x)</p>
            </div>
          )}
          {mostActiveDay && mostActiveDay.count > 0 && (
            <div>
              <p className="text-lg sm:text-xl font-bold">{mostActiveDay.day}s</p>
              <p className="text-white/70 text-sm mt-1">most active day</p>
            </div>
          )}
        </div>

        {topTag && (
          <div className="mt-6 pt-4 border-t border-white/20">
            <p className="text-sm text-white/60">Your signature tag</p>
            <p className="text-lg font-bold">#{topTag.tag} <span className="text-white/50 font-normal">({topTag.count} uses)</span></p>
          </div>
        )}
      </div>
    </div>
  )
}

// Mood trend chart
function MoodTrendChart({ moodTimeline }) {
  if (!moodTimeline || moodTimeline.length < 2) return null

  const data = moodTimeline.map((d) => {
    const [y, m] = d.month.split('-')
    const date = new Date(parseInt(y), parseInt(m) - 1)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      Positive: d.positive,
      Calm: d.calm,
      Neutral: d.neutral,
      Challenging: d.challenging,
    }
  })

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg"></span>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Mood Trends Over Time</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="Positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            <Area type="monotone" dataKey="Calm" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
            <Area type="monotone" dataKey="Neutral" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
            <Area type="monotone" dataKey="Challenging" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Weekday heatmap
function WeekdayHeatmap({ weekdayDistribution }) {
  const maxCount = Math.max(...weekdayDistribution.map(d => d.count), 1)
  
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Writing Peaks by Day</h3>
      <div className="grid grid-cols-7 gap-2">
        {weekdayDistribution.map((d) => {
          const intensity = d.count / maxCount
          const bg = intensity === 0
            ? 'bg-gray-100 dark:bg-zinc-800'
            : intensity <= 0.25
            ? 'bg-pink-100 dark:bg-pink-900/30'
            : intensity <= 0.5
            ? 'bg-pink-300 dark:bg-pink-700/50'
            : intensity <= 0.75
            ? 'bg-pink-400 dark:bg-pink-600'
            : 'bg-pink-600 dark:bg-pink-400'
          const textColor = intensity > 0.5 ? 'text-white dark:text-white' : 'text-gray-700 dark:text-gray-300'

          return (
            <div
              key={d.day}
              className={`${bg} rounded-xl p-3 text-center transition-all hover:scale-105`}
              title={`${d.day}: ${d.count} experiences`}
            >
              <p className={`text-xs font-semibold ${textColor} opacity-70`}>{d.day.slice(0, 3)}</p>
              <p className={`text-xl font-black ${textColor} mt-1`}>{d.count}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}


// Main component
export default function AnalyticsCharts({ analytics }) {
  if (!analytics || analytics.overview.totalExperiences === 0) {
    return <EmptyState />
  }

  const {
    overview, categoryDistribution, moodDistribution, experiencesOverTime,
    streaks, weekdayDistribution, topTags, reflectionsReceived,
    dailyActivity, moodTimeline, firstExperienceDate
  } = analytics

  // Format month labels
  const timelineData = experiencesOverTime.map((d) => {
    const [y, m] = d.month.split('-')
    const date = new Date(parseInt(y), parseInt(m) - 1)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      count: d.count,
    }
  })

  // Category chart data with short labels
  const categoryData = categoryDistribution.slice(0, 8).map((d) => ({
    name: CATEGORY_CONFIG[d.category]?.label || d.category,
    shortName: (CATEGORY_CONFIG[d.category]?.label || d.category).split(' ')[0],
    count: d.count,
  }))

  // Mood chart data with emojis
  const moodData = moodDistribution.slice(0, 10).map((d) => ({
    name: `${MOOD_EMOJIS[d.mood] || ''} ${d.mood}`,
    count: d.count,
  }))

  const mostActiveDay = weekdayDistribution.reduce((best, d) => d.count > best.count ? d : best, weekdayDistribution[0])

  // Build smart insights
  const insights = []
  if (mostActiveDay && mostActiveDay.count > 0) {
    insights.push(`You're most active on ${mostActiveDay.day}s \u2014 ${mostActiveDay.count} experience${mostActiveDay.count > 1 ? 's' : ''} logged.`)
  }
  if (streaks.current >= 7) {
    insights.push(`\ud83d\udd25 ${streaks.current}-day streak! You're building a powerful habit.`)
  } else if (streaks.current >= 3) {
    insights.push(`${streaks.current}-day streak going \u2014 keep showing up!`)
  } else if (streaks.longest > 0) {
    insights.push(`Your best streak was ${streaks.longest} days. Can you beat it?`)
  }
  if (moodDistribution.length > 0) {
    const topMood = moodDistribution[0]
    const emoji = MOOD_EMOJIS[topMood.mood] || ''
    insights.push(`Your most frequent mood is ${emoji} ${topMood.mood} \u2014 it appears in ${topMood.count} experience${topMood.count > 1 ? 's' : ''}.`)
  }
  if (categoryDistribution.length > 0) {
    const topCat = categoryDistribution[0]
    const catLabel = CATEGORY_CONFIG[topCat.category]?.label || topCat.category
    insights.push(`"${catLabel}" is your top category with ${topCat.count} entries.`)
  }
  if (reflectionsReceived > 0 && overview.publicCount > 0) {
    const ratio = (reflectionsReceived / overview.publicCount).toFixed(1)
    insights.push(`Your public experiences average ${ratio} reflection${parseFloat(ratio) !== 1 ? 's' : ''} each.`)
  }
  if (overview.publicCount === 0 && overview.totalExperiences > 2) {
    insights.push(`All your experiences are private. Make some public to get reflections from the community!`)
  }

  return (
    <div className="space-y-8">
      {/* Year in Review */}
      <YearInReview analytics={analytics} />

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={FiActivity} label="Experiences" value={overview.totalExperiences} color="purple" />
        <StatCard icon={FiLink} label="Memory Links" value={overview.totalLinks} color="pink" />
        <StatCard icon={FiMessageCircle} label="Reflections Written" value={overview.totalReflections} color="cyan" />
        <StatCard icon={FiZap} label="Current Streak" value={`${streaks.current}d`} sub={`Best: ${streaks.longest}d`} color="amber" />
        <StatCard icon={FiAward} label="Reflections Received" value={reflectionsReceived} color="green" />
        <StatCard icon={FiCalendar} label="Most Active Day" value={mostActiveDay?.day || '\u2014'} sub={`${mostActiveDay?.count || 0} experiences`} color="blue" />
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">\ud83d\udca1</span>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 dark:border-zinc-800/50"
              >
                <span className="text-purple-500 mt-0.5 text-sm">\u25b8</span>
                <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contribution Heatmap */}
      {dailyActivity && <ContributionHeatmap dailyActivity={dailyActivity} />}

      {/* Privacy Split */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Privacy Split</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${(overview.privateCount / overview.totalExperiences) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-sm flex-shrink-0">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <FiLock className="h-3.5 w-3.5 text-purple-500" /> {overview.privateCount} Private
            </span>
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <FiEye className="h-3.5 w-3.5 text-pink-500" /> {overview.publicCount} Public
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-5">
          <FiTrendingUp className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Experiences Over Time</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Experiences" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood Trend Line */}
      <MoodTrendChart moodTimeline={moodTimeline} />

      {/* Category + Mood side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Categories</h3>
          {categoryData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis type="category" dataKey="shortName" tick={{ fontSize: 11 }} stroke="#9ca3af" width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Experiences" radius={[0, 4, 4, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No category data yet</p>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Mood Spectrum</h3>
          {moodData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={moodData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="count" nameKey="name">
                    {moodData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Add moods to see the spectrum</p>
          )}
        </div>
      </div>

      {/* Weekday Heatmap */}
      <WeekdayHeatmap weekdayDistribution={weekdayDistribution} />

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiTag className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Tags</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {topTags.map((t, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-sm font-medium border"
                style={{
                  backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}15`,
                  borderColor: `${CHART_COLORS[i % CHART_COLORS.length]}40`,
                  color: CHART_COLORS[i % CHART_COLORS.length],
                }}
              >
                #{t.tag} <span className="opacity-60">({t.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
