/**
 * Server-side API utilities for SSR
 * These functions run on the Next.js server and call the Express backend
 */

import { cookies } from 'next/headers'

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1`

/**
 * Make authenticated request to backend from server component
 * Forwards the authentication cookie from client to backend
 * Handles 401s by attempting to refresh the token.
 */
async function fetchFromBackend(endpoint, options = {}, isRetry = false) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  const refreshToken = cookieStore.get('refreshToken')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Forward authentication cookies to backend
  let cookieString = ''
  if (token) cookieString += `token=${token.value}; `
  if (refreshToken) cookieString += `refreshToken=${refreshToken.value}; `
  
  if (cookieString) {
    headers['Cookie'] = cookieString.trim()
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  // If 401, try to refresh
  if (response.status === 401 && !isRetry && endpoint !== '/auth/refresh') {
    if (refreshToken) {
      // Attempt to refresh
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Cookie': `refreshToken=${refreshToken.value}`
        }
      })

      if (refreshRes.ok) {
        // Read the new token from the response headers
        const setCookieHeader = refreshRes.headers.get('set-cookie')
        if (setCookieHeader) {
          // In Next.js App Router server components, we can't easily mutate the response headers directly
          // to send the cookie back to the browser without middleware. But the server can use it for retrying.
          
          // Retry original request with the new cookie from the refresh endpoint
          headers['Cookie'] = setCookieHeader

          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include',
          })
        }
      }
    }
  }

  if (!response.ok) {
    // Return null for 404s to allow components to handle not-found UI
    if (response.status === 404) {
      return null
    }
    
    if (response.status === 401) {
      throw new Error('Unauthorized')
    }
    
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }

  return response.json()
}

/**
 * Get current authenticated user
 * Always fetch fresh to ensure auth state is current
 */
export async function getCurrentUser() {
  try {
    const data = await fetchFromBackend('/auth/me', {
      cache: 'no-store' // Always fresh for authentication
    })
    return data.user
  } catch (error) {
    return null
  }
}

/**
 * Get all experiences for current user
 * Revalidates every 60 seconds for balance between performance and freshness
 */
export async function getExperiences() {
  try {
    const data = await fetchFromBackend('/experiences', {
      next: { revalidate: 60 } // Cache for 60 seconds
    })
    return data.experiences || []
  } catch (error) {
    console.error('Failed to fetch experiences:', error)
    return []
  }
}

/**
 * Get all links for current user
 * Revalidates every 60 seconds
 */
export async function getLinks() {
  try {
    const data = await fetchFromBackend('/links?includeAllIds=true', {
      next: { revalidate: 60 } // Cache for 60 seconds
    })
    return data.links || []
  } catch (error) {
    console.error('Failed to fetch links:', error)
    return []
  }
}

/**
 * Get public experiences for explore page
 * Revalidates every 5 minutes (public data changes less frequently)
 */
export async function getPublicExperiences() {
  try {
    const data = await fetchFromBackend('/explore', {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    return data.experiences || []
  } catch (error) {
    console.error('Failed to fetch public experiences:', error)
    return []
  }
}

/**
 * Get single experience by ID
 * Revalidates every 60 seconds
 */
export async function getExperience(id) {
  try {
    const data = await fetchFromBackend(`/experiences/${id}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    })
    // fetchFromBackend returns null for 404s
    if (!data) return null
    return data
  } catch (error) {
    console.error(`Failed to fetch experience ${id}:`, error)
    return null
  }
}

/**
 * Get single link by ID
 * Revalidates every 60 seconds
 */
export async function getLink(id) {
  try {
    const data = await fetchFromBackend(`/links/${id}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    })
    // fetchFromBackend returns null for 404s
    if (!data) return null
    return data.link
  } catch (error) {
    console.error(`Failed to fetch link ${id}:`, error)
    return null
  }
}

/**
 * Get analytics data for current user
 * No caching — always fresh for accurate stats
 */
export async function getAnalytics() {
  try {
    const data = await fetchFromBackend('/analytics', {
      cache: 'no-store'
    })
    return data
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return null
  }
}

/**
 * Calculate category stats from experiences (this month only)
 */
export function getCategoryStats(experiences) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const thisMonthExperiences = experiences.filter(exp => {
    const expDate = new Date(exp.date)
    return expDate.getFullYear() === currentYear && expDate.getMonth() === currentMonth
  })

  const stats = thisMonthExperiences.reduce((acc, exp) => {
    const existing = acc.find(s => s.category === exp.category)
    if (existing) {
      existing.count++
    } else {
      acc.push({ category: exp.category, count: 1 })
    }
    return acc
  }, [])

  return stats
}
