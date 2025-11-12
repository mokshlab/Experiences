/**
 * Frontend Security Utilities
 * Protects against XSS attacks when displaying user-generated content
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this before displaying any user-generated content
 * 
 * @param {string} html - Raw HTML string
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return ''
  
  // Create temporary element to parse HTML
  const temp = document.createElement('div')
  temp.textContent = html  // This escapes all HTML tags
  
  return temp.innerHTML
}

/**
 * Escape HTML entities to prevent XSS
 * Use this for displaying text that might contain special characters
 * 
 * @param {string} text - Raw text
 * @returns {string} Escaped text safe for HTML display
 */
export function escapeHtml(text) {
  if (!text || typeof text !== 'string') return ''
  
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Sanitize URL to prevent javascript: and data: attacks
 * Use this before setting href or src attributes from user input
 * 
 * @param {string} url - URL to validate
 * @returns {string|null} Safe URL or null if invalid
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return null
  
  // Remove whitespace
  url = url.trim()
  
  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ]
  
  const lowerUrl = url.toLowerCase()
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return null
    }
  }
  
  // Only allow http, https, mailto, tel
  const allowedProtocols = ['http://', 'https://', 'mailto:', 'tel:']
  const hasValidProtocol = allowedProtocols.some(protocol => 
    lowerUrl.startsWith(protocol)
  )
  
  // Relative URLs are safe (starting with / or .)
  const isRelative = url.startsWith('/') || url.startsWith('.')
  
  return (hasValidProtocol || isRelative) ? url : null
}

/**
 * Validate and sanitize user input
 * Use this for form inputs before sending to backend
 * 
 * @param {string} input - User input
 * @param {Object} options - Validation options
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input, options = {}) {
  if (!input || typeof input !== 'string') return ''
  
  let sanitized = input.trim()
  
  // Remove null bytes (security risk)
  sanitized = sanitized.replace(/\0/g, '')
  
  // Limit length if specified
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength)
  }
  
  // Remove leading/trailing whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Validate email format (basic check)
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid format
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  
  // Basic email pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email)
}

/**
 * Check if content is safe to render
 * Use this before rendering user-generated content
 * 
 * @param {string} content - Content to check
 * @returns {boolean} True if safe to render
 */
export function isSafeContent(content) {
  if (!content || typeof content !== 'string') return true
  
  // Check for potentially dangerous patterns
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,  // Event handlers like onclick=
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(content))
}

/**
 * Safe JSON parse with error handling
 * Prevents crashes from malformed JSON
 * 
 * @param {string} json - JSON string
 * @param {*} fallback - Fallback value if parse fails
 * @returns {*} Parsed object or fallback
 */
export function safeJsonParse(json, fallback = null) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}
