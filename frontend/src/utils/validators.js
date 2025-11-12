/**
 * Utility functions for validation
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export function validatePassword(password) {
  if (!password) {
    return { isValid: false, message: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' }
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain uppercase, lowercase, and a number' }
  }
  
  return { isValid: true, message: 'Password is valid' }
}

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} Validation result with isValid and message
 */
export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, message: `${fieldName} is required` }
  }
  return { isValid: true, message: '' }
}

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Name of the field
 * @returns {Object} Validation result
 */
export function validateLength(text, minLength = 0, maxLength = Infinity, fieldName = 'Field') {
  if (!text) {
    return { isValid: false, message: `${fieldName} is required` }
  }
  
  if (text.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters` }
  }
  
  if (text.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be no more than ${maxLength} characters` }
  }
  
  return { isValid: true, message: '' }
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidUrl(url) {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Validate color hex format
 * @param {string} color - Color hex string
 * @returns {boolean} True if valid hex color
 */
export function isValidHexColor(color) {
  if (!color) return false
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexRegex.test(color)
}
