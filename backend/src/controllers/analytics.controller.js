import prisma from '../utils/prisma.js'

/**
 * Get analytics data for the current user
 * All stats are computed from the user's actual data — no mocks, no AI
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Parallel fetch: experiences, reflections count, links count
    const [experiences, reflectionsCount, linksCount] = await Promise.all([
      prisma.experience.findMany({
        where: { userId },
        select: {
          id: true,
          date: true,
          category: true,
          mood: true,
          isPublic: true,
          tags: true,
          createdAt: true,
          _count: { select: { reflections: true } },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.reflection.count({ where: { userId } }),
      prisma.link.count({ where: { userId } }),
    ])

    const total = experiences.length

    if (total === 0) {
      return res.json({
        overview: { totalExperiences: 0, totalReflections: reflectionsCount, totalLinks: linksCount, publicCount: 0, privateCount: 0 },
        categoryDistribution: [],
        moodDistribution: [],
        experiencesOverTime: [],
        streaks: { current: 0, longest: 0 },
        weekdayDistribution: [],
        topTags: [],
        reflectionsReceived: 0,
        dailyActivity: {},
        moodTimeline: [],
        firstExperienceDate: null,
      })
    }

    // --- Category Distribution ---
    const categoryMap = {}
    experiences.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + 1
    })
    const categoryDistribution = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    // --- Mood Distribution ---
    const moodMap = {}
    experiences.forEach((e) => {
      if (e.mood) {
        moodMap[e.mood] = (moodMap[e.mood] || 0) + 1
      }
    })
    const moodDistribution = Object.entries(moodMap)
      .map(([mood, count]) => ({ mood, count }))
      .sort((a, b) => b.count - a.count)

    // --- Experiences Over Time (last 12 months) ---
    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
    const monthlyMap = {}
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      monthlyMap[key] = 0
    }
    experiences.forEach((e) => {
      const d = new Date(e.date)
      if (d >= twelveMonthsAgo) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (monthlyMap[key] !== undefined) monthlyMap[key]++
      }
    })
    const experiencesOverTime = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      count,
    }))

    // --- Streaks (consecutive days with at least one experience) ---
    const uniqueDays = new Set()
    experiences.forEach((e) => {
      const d = new Date(e.date)
      uniqueDays.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
    })
    const sortedDays = [...uniqueDays].sort()

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 1

    // Build longest streak
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1])
      const curr = new Date(sortedDays[i])
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Current streak: count backwards from today
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const yesterdayDate = new Date(now)
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterdayStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`

    if (uniqueDays.has(todayStr) || uniqueDays.has(yesterdayStr)) {
      // Start from today or yesterday
      let checkDate = uniqueDays.has(todayStr) ? new Date(now) : new Date(yesterdayDate)
      while (true) {
        const checkStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`
        if (uniqueDays.has(checkStr)) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1)
        } else {
          break
        }
      }
    }

    // --- Weekday Distribution ---
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const weekdayMap = [0, 0, 0, 0, 0, 0, 0]
    experiences.forEach((e) => {
      const day = new Date(e.date).getDay()
      weekdayMap[day]++
    })
    const weekdayDistribution = dayNames.map((day, i) => ({ day, count: weekdayMap[i] }))

    // --- Public vs Private ---
    const publicCount = experiences.filter((e) => e.isPublic).length
    const privateCount = total - publicCount

    // --- Top Tags ---
    const tagMap = {}
    experiences.forEach((e) => {
      (e.tags || []).forEach((tag) => {
        const normalized = tag.toLowerCase().trim()
        if (normalized) tagMap[normalized] = (tagMap[normalized] || 0) + 1
      })
    })
    const topTags = Object.entries(tagMap)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)

    // --- Reflections received on user's experiences ---
    const reflectionsReceived = experiences.reduce((sum, e) => sum + (e._count?.reflections || 0), 0)

    // --- Daily Activity (for contribution heatmap, last 365 days) ---
    const oneYearAgo = new Date(now)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const dailyActivity = {}
    experiences.forEach((e) => {
      const d = new Date(e.date)
      if (d >= oneYearAgo) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        dailyActivity[key] = (dailyActivity[key] || 0) + 1
      }
    })

    // --- Mood Timeline (mood trend over time, grouped by month) ---
    const moodTimeline = []
    const moodGroups = { positive: 0, calm: 0, neutral: 0, challenging: 0 }
    const positiveMoods = new Set(['Happy', 'Joyful', 'Excited', 'Grateful', 'Proud', 'Inspired', 'Energized', 'Loved', 'Blessed'])
    const calmMoods = new Set(['Peaceful', 'Calm', 'Nostalgic', 'Hopeful'])
    const neutralMoods = new Set(['Curious', 'Surprised', 'Content'])
    // Build monthly mood scores
    const monthlyMoods = {}
    experiences.forEach((e) => {
      if (!e.mood) return
      const d = new Date(e.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyMoods[key]) monthlyMoods[key] = { positive: 0, calm: 0, neutral: 0, challenging: 0, total: 0 }
      monthlyMoods[key].total++
      if (positiveMoods.has(e.mood)) monthlyMoods[key].positive++
      else if (calmMoods.has(e.mood)) monthlyMoods[key].calm++
      else if (neutralMoods.has(e.mood)) monthlyMoods[key].neutral++
      else monthlyMoods[key].challenging++
    })
    Object.entries(monthlyMoods).sort(([a], [b]) => a.localeCompare(b)).forEach(([month, data]) => {
      moodTimeline.push({ month, ...data })
    })

    // --- First experience date for "year in review" ---
    const firstExperienceDate = experiences[0]?.date || null

    res.json({
      overview: {
        totalExperiences: total,
        totalReflections: reflectionsCount,
        totalLinks: linksCount,
        publicCount,
        privateCount,
      },
      categoryDistribution,
      moodDistribution,
      experiencesOverTime,
      streaks: { current: currentStreak, longest: longestStreak },
      weekdayDistribution,
      topTags,
      reflectionsReceived,
      dailyActivity,
      moodTimeline,
      firstExperienceDate,
    })
  } catch (error) {
    next(error)
  }
}
