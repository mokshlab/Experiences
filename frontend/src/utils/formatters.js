/**
 * Utility functions for formatting data
 */

/**
 * Format a date to a readable string
 * NO timezone conversion - displays exactly as stored
 * @param {Date|string} date - Date to format (ISO string)
 * @param {Object} options - Not used (kept for compatibility)
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return ''
  
  // Parse ISO string directly without timezone conversion
  const dateStr = typeof date === 'string' ? date : date.toISOString()
  const [datePart] = dateStr.split('T')
  const [year, month, day] = datePart.split('-')
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const monthName = monthNames[parseInt(month) - 1]
  
  return `${monthName} ${parseInt(day)}, ${year}`
}

/**
 * Format a date with optional time display
 * Shows time only if it's not midnight (00:00:00)
 * NO timezone conversion - displays exactly as stored
 * @param {Date|string} date - Date to format (ISO string)
 * @returns {string} Formatted date string with optional time
 */
export function formatDateTime(date) {
  if (!date) return ''
  
  // Parse ISO string directly without timezone conversion
  const dateStr = typeof date === 'string' ? date : date.toISOString()
  const [datePart, timePart] = dateStr.split('T')
  const [year, month, day] = datePart.split('-')
  const timeStr = timePart?.substring(0, 5) || '00:00' // Get HH:MM
  
  const hasTime = timeStr !== '00:00'
  
  // Format date manually to avoid timezone issues
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  const monthName = monthNames[parseInt(month) - 1]
  const dateFormatted = `${monthName} ${parseInt(day)}, ${year}`
  
  if (hasTime) {
    // Convert 24-hour to 12-hour format
    const [hours, minutes] = timeStr.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    return `${dateFormatted} at ${hour12}:${minutes} ${ampm}`
  }
  
  return dateFormatted
}

/**
 * Format a date to a short string (e.g., "Jan 15, 2025")
 * NO timezone conversion - displays exactly as stored
 * @param {Date|string} date - Date to format (ISO string)
 * @returns {string} Short formatted date string
 */
export function formatShortDate(date) {
  if (!date) return ''
  
  const dateStr = typeof date === 'string' ? date : date.toISOString()
  const [datePart] = dateStr.split('T')
  const [year, month, day] = datePart.split('-')
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthName = monthNames[parseInt(month) - 1]
  
  return `${monthName} ${parseInt(day)}, ${year}`
}

/**
 * Format a date to a relative time string (e.g., "2 days ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now - then) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

/**
 * Format tags from comma-separated string to array
 * @param {string} tagsString - Comma-separated tags
 * @returns {string[]} Array of trimmed tags
 */
export function formatTags(tagsString) {
  if (!tagsString) return []
  return tagsString.split(',').map(tag => tag.trim()).filter(Boolean)
}

/**
 * Format array of tags to comma-separated string
 * @param {string[]} tagsArray - Array of tags
 * @returns {string} Comma-separated string
 */
export function formatTagsToString(tagsArray) {
  if (!Array.isArray(tagsArray)) return ''
  return tagsArray.join(', ')
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
export function truncateText(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Format a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (typeof num !== 'number') return '0'
  return num.toLocaleString('en-US')
}
