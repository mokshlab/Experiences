/**
 * Custom hook for managing experience-related operations
 */

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'

/**
 * Hook for managing experience operations
 * @returns {Object} Experience state and methods
 */
export function useExperience() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Create a new experience
   */
  const createExperience = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const experience = await apiClient.experiences.create(data)
      return experience
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Update an experience
   */
  const updateExperience = async (id, data) => {
    setLoading(true)
    setError(null)
    try {
      const experience = await apiClient.experiences.update(id, data)
      return experience
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete an experience
   */
  const deleteExperience = async (id) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.experiences.delete(id)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createExperience,
    updateExperience,
    deleteExperience
  }
}
