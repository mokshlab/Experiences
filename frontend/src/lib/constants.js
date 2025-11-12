/**
 * Application constants — categories, moods, API config.
 */

import { 
  FiBookOpen, FiSun, FiCompass, FiStar, FiZap, FiActivity, 
  FiBriefcase, FiTarget, FiBook, FiHeart, FiUsers, FiAward, 
  FiTrendingUp, FiMoreHorizontal, FiCloud, FiFlag
} from 'react-icons/fi'

// Categories
export const CATEGORIES = [
  // Daily & Personal
  { value: 'DAILY_JOURNAL', label: 'Daily Journal', icon: FiBookOpen, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  { value: 'SOMETHING_NEW', label: 'Something New', icon: FiSun, color: 'text-amber-500', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  { value: 'PERSONAL_GROWTH', label: 'Personal Growth', icon: FiTrendingUp, color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/30' },
  { value: 'DREAMS_GOALS', label: 'Dreams & Goals', icon: FiFlag, color: 'text-sky-600', bgColor: 'bg-sky-100 dark:bg-sky-900/30' },
  
  // Relationships
  { value: 'RELATIONSHIPS', label: 'Relationships', icon: FiHeart, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  { value: 'FAMILY', label: 'Family', icon: FiUsers, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900/30' },
  
  // Activities & Hobbies
  { value: 'HOBBIES', label: 'Hobbies & Interests', icon: FiStar, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  { value: 'SPORTS', label: 'Sports & Fitness', icon: FiActivity, color: 'text-lime-600', bgColor: 'bg-lime-100 dark:bg-lime-900/30' },
  
  // Adventure & Nature
  { value: 'TRAVEL_ADVENTURE', label: 'Travel & Adventure', icon: FiCompass, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
  { value: 'NATURE_OUTDOORS', label: 'Nature & Outdoors', icon: FiCloud, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { value: 'CHALLENGES', label: 'Challenges', icon: FiZap, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  
  // Professional & Education
  { value: 'WORK_CAREER', label: 'Work & Career', icon: FiBriefcase, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { value: 'EDUCATION', label: 'Education & Learning', icon: FiBook, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  { value: 'ACHIEVEMENTS', label: 'Achievements', icon: FiTarget, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  
  // Health & Other
  { value: 'HEALTH_WELLNESS', label: 'Health & Wellness', icon: FiAward, color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-900/30' },
  { value: 'OTHER', label: 'Other', icon: FiMoreHorizontal, color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-800/50' }
]

// Category configuration as object for easy lookup by value
export const CATEGORY_CONFIG = CATEGORIES.reduce((acc, category) => {
  acc[category.value] = category
  return acc
}, {})

// Valid category values for validation
export const VALID_CATEGORIES = CATEGORIES.map(cat => cat.value)

// Moods
export const MOODS = [
  // Positive & Uplifting
  { value: 'Happy', label: 'Happy', emoji: '😊' },
  { value: 'Joyful', label: 'Joyful', emoji: '😄' },
  { value: 'Excited', label: 'Excited', emoji: '🤩' },
  { value: 'Grateful', label: 'Grateful', emoji: '🙏' },
  { value: 'Proud', label: 'Proud', emoji: '💪' },
  { value: 'Inspired', label: 'Inspired', emoji: '✨' },
  { value: 'Energized', label: 'Energized', emoji: '⚡' },
  { value: 'Loved', label: 'Loved', emoji: '❤️' },
  { value: 'Blessed', label: 'Blessed', emoji: '🌈' },
  
  // Calm & Reflective
  { value: 'Peaceful', label: 'Peaceful', emoji: '😌' },
  { value: 'Calm', label: 'Calm', emoji: '🧘' },
  { value: 'Nostalgic', label: 'Nostalgic', emoji: '🌅' },
  { value: 'Hopeful', label: 'Hopeful', emoji: '🌱' },
  
  // Neutral & Surprised
  { value: 'Curious', label: 'Curious', emoji: '🔍' },
  { value: 'Surprised', label: 'Surprised', emoji: '😲' },
  { value: 'Content', label: 'Content', emoji: '☺️' },
  
  // Challenging & Growth
  { value: 'Determined', label: 'Determined', emoji: '🎯' },
  { value: 'Overwhelmed', label: 'Overwhelmed', emoji: '😵' },
  { value: 'Anxious', label: 'Anxious', emoji: '😰' },
  { value: 'Frustrated', label: 'Frustrated', emoji: '😤' },
  { value: 'Sad', label: 'Sad', emoji: '😢' },
  { value: 'Disappointed', label: 'Disappointed', emoji: '😞' },
  { value: 'Tired', label: 'Tired', emoji: '😴' }
]

// Mood emojis as object for easy lookup by value
export const MOOD_EMOJIS = MOODS.reduce((acc, mood) => {
  acc[mood.value] = mood.emoji
  return acc
}, {})

// API
export const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1`
