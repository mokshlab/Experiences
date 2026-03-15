import { API_BASE_URL } from './constants'

export async function apiFetch(url, options = {}, isRetry = false) {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      // Intercept 401s and try to refresh token (unless this is already a retry or the refresh endpoint itself)
      if (response.status === 401 && !isRetry && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          })
          
          if (refreshRes.ok) {
            // Refresh succeeded, retry the original request
            return apiFetch(url, options, true)
          }
        } catch (refreshErr) {
          console.error('Refresh token failed:', refreshErr)
        }
      }

      // Create error with clean message for user display
      const error = new Error(data.error || data.message || 'Request failed')
      error.status = response.status
      error.statusText = response.statusText
      throw error
    }

    return { data, response }
  } catch (error) {
    // Preserve status codes and error details
    const enhancedError = new Error(error.message || 'Network error')
    enhancedError.status = error.status
    enhancedError.statusText = error.statusText
    throw enhancedError
  }
}

/**
 * Base fetch wrapper — sends credentials (httpOnly cookies)
 * and handles JSON parsing / error normalization.
 * Includes interceptor logic for 401 Unauthorized to automatically refresh tokens.
 */
// (apiFetch exported above)

/**
 * API client object with methods for different resources
 */
export const apiClient = {
  // Experience-related APIs
  experiences: {
    /**
     * Get all user experiences
     */
    getAll: async () => {
      const { data } = await apiFetch(`${API_BASE_URL}/experiences`)
      return data.experiences
    },

    /**
     * Get single experience
     */
    getById: async (id) => {
      const { data } = await apiFetch(`${API_BASE_URL}/experiences/${id}`)
      // Backend returns experience directly, not wrapped in { experience }
      return data
    },

    /**
     * Create new experience
     */
    create: async (experienceData) => {
      const { data } = await apiFetch(`${API_BASE_URL}/experiences`, {
        method: 'POST',
        body: JSON.stringify(experienceData),
      })
      return data.experience
    },

    /**
     * Update experience
     */
    update: async (id, experienceData) => {
      const { data } = await apiFetch(`${API_BASE_URL}/experiences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(experienceData),
      })
      return data.experience
    },

    /**
     * Delete experience
     */
    delete: async (id) => {
      await apiFetch(`${API_BASE_URL}/experiences/${id}`, {
        method: 'DELETE',
      })
    },
  },

  // Reflection-related APIs
  reflections: {
    /**
     * Get reflections for an experience
     */
    getByExperienceId: async (experienceId, page = 0, limit = 20) => {
      const { data } = await apiFetch(`${API_BASE_URL}/experiences/${experienceId}/reflections?page=${page}&limit=${limit}`)
      return data
    },

    /**
     * Add reflection to experience
     */
    create: async (experienceId, reflectionData) => {
      const { data } = await apiFetch(`${API_BASE_URL}/experiences/${experienceId}/reflections`, {
        method: 'POST',
        body: JSON.stringify(reflectionData),
      })
      return data
    },

    /**
     * Delete reflection
     */
    delete: async (experienceId, reflectionId) => {
      await apiFetch(`${API_BASE_URL}/experiences/${experienceId}/reflections/${reflectionId}`, {
        method: 'DELETE',
      })
    },
  },

  // Link-related APIs
  links: {
    /**
     * Get all user links
     */
    getAll: async (includeAllIds = false) => {
      const url = includeAllIds ? `${API_BASE_URL}/links?includeAllIds=true` : `${API_BASE_URL}/links`
      const { data } = await apiFetch(url)
      return data.links
    },

    /**
     * Get single link
     */
    getById: async (id) => {
      const { data } = await apiFetch(`${API_BASE_URL}/links/${id}`)
      return data.link
    },

    /**
     * Create new link
     */
    create: async (linkData) => {
      const { data } = await apiFetch(`${API_BASE_URL}/links`, {
        method: 'POST',
        body: JSON.stringify(linkData),
      })
      return data.link
    },

    /**
     * Update link
     */
    update: async (id, linkData) => {
      const { data } = await apiFetch(`${API_BASE_URL}/links/${id}`, {
        method: 'PUT',
        body: JSON.stringify(linkData),
      })
      return data.link
    },

    /**
     * Delete link
     */
    delete: async (id) => {
      await apiFetch(`${API_BASE_URL}/links/${id}`, {
        method: 'DELETE',
      })
    },

    /**
     * Add experience to link
     */
    addExperience: async (linkId, experienceId) => {
      const { data } = await apiFetch(`${API_BASE_URL}/links/${linkId}/experiences`, {
        method: 'POST',
        body: JSON.stringify({ experienceId }),
      })
      return data.experienceLink
    },

    /**
     * Remove experience from link
     */
    removeExperience: async (linkId, experienceId) => {
      await apiFetch(`${API_BASE_URL}/links/${linkId}/experiences/${experienceId}`, {
        method: 'DELETE',
      })
    },

  },

  // Explore/Public experiences APIs
  explore: {
    /**
     * Get public experiences with optional category filter
     */
    getPublic: async (category = null) => {
      const url = category ? `${API_BASE_URL}/explore?category=${category}` : `${API_BASE_URL}/explore`
      const { data } = await apiFetch(url)
      return data
    },
  },

  // User profile APIs
  user: {
    /**
     * Get current user profile
     */
    getProfile: async () => {
      const { data } = await apiFetch(`${API_BASE_URL}/user/profile`)
      return data.user
    },

    /**
     * Update user profile (name, image)
     */
    updateProfile: async (profileData) => {
      const { data } = await apiFetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      })
      return data
    },

    /**
     * Change password
     */
    changePassword: async (passwordData) => {
      const { data } = await apiFetch(`${API_BASE_URL}/user/password`, {
        method: 'PUT',
        body: JSON.stringify(passwordData),
      })
      return data
    },

    /**
     * Delete account (requires password)
     */
    deleteAccount: async (passwordData) => {
      const { data } = await apiFetch(`${API_BASE_URL}/user/account`, {
        method: 'DELETE',
        body: JSON.stringify(passwordData),
      })
      return data
    },
  },
}
