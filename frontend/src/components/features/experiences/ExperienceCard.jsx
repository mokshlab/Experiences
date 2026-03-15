"use client"

import { FiLock, FiGlobe, FiMessageCircle, FiCalendar, FiUser } from 'react-icons/fi'
import Link from 'next/link'
import Image from 'next/image'
import { CATEGORY_CONFIG, MOOD_EMOJIS } from '@/lib/constants'
import { formatDateTime } from '@/utils'

const ExperienceCard = ({ experience, showAuthor = false, from = 'dashboard' }) => {
  const categoryConfig = CATEGORY_CONFIG[experience.category] || CATEGORY_CONFIG.OTHER
  const CategoryIcon = categoryConfig.icon
  const moodEmoji = MOOD_EMOJIS[experience.mood]

  return (
    <Link href={`/experiences/${experience.id}?from=${from}`}>
      <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-purple-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-purple-600 cursor-pointer">
        {/* Author Info (for Explore page) */}
        {showAuthor && experience.user && (
          <div className="mb-4 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-zinc-700">
            {experience.user.image ? (
              <Image
                src={experience.user.image}
                alt={experience.user.name || 'User'}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <FiUser className="h-4 w-4 text-white" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {experience.user.name || 'Anonymous'}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {experience.title}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FiCalendar className="h-4 w-4" />
                <span>{formatDateTime(experience.date)}</span>
              </div>
            </div>
          </div>

          {/* small category accent top-right */}
          <div className={`absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center ${categoryConfig.bgColor}`} aria-hidden="true">
            <CategoryIcon className={`${categoryConfig.color} h-4 w-4`} />
          </div>
        </div>

        {/* Content Preview */}
        <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
          {experience.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Category Badge */}
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${categoryConfig.bgColor} ${categoryConfig.color}`}>
            <CategoryIcon className="h-3 w-3" />
            {categoryConfig.label}
          </span>

          <div className="flex items-center gap-3">
            {/* Privacy badge (moved to footer to avoid repeating header avatar) */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${experience.isPublic ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-300'}`}>
              {experience.isPublic ? <FiGlobe className="h-3 w-3" /> : <FiLock className="h-3 w-3" />}
              <span className="sr-only">{experience.isPublic ? 'Public' : 'Private'}</span>
            </span>

            {/* Reflections Count */}
            {experience.isPublic && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-300">
                <FiMessageCircle className="h-4 w-4" />
                <span>{experience.reflectionsCount || experience._count?.reflections || 0}</span>
              </div>
            )}
          </div>
        </div>

        {/* Mood Badge (if exists) */}
        {experience.mood && moodEmoji && (
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <span className="text-sm">{moodEmoji}</span>
            {experience.mood}
          </div>
        )}
      </div>
    </Link>
  )
}

export default ExperienceCard
