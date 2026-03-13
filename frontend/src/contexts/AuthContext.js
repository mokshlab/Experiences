'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/lib/constants'

// Create a local wrapper for contexts that handles the 401 interceptor logic
// similar to api-client.js but without circular dependencies
async function contextFetch(url, options = {}, isRetry = false) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  // Try to parse JSON, handle empty responses gracefully
  let data = {}
  try {
    const text = await response.text()
    if (text) data = JSON.parse(text)
  } catch (e) {
    // Ignore JSON parse errors for empty responses
  }

  if (!response.ok) {
    if (response.status === 401 && !isRetry && !url.includes('/auth/refresh') && !url.includes('/auth/login') && !url.includes('/auth/logout')) {
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        
        if (refreshRes.ok) {
          return contextFetch(url, options, true)
        }
      } catch (refreshErr) {
        console.error('Refresh token failed:', refreshErr)
      }
    }

    const error = new Error(data.error || data.message || 'Request failed')
    error.status = response.status
    throw error
  }

  return { data, response }
}

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data } = await contextFetch(`${API_BASE_URL}/auth/me`)
      setUser(data.user)
    } catch (error) {
      if (error.message.includes('fetch') || error.message.includes('Network')) {
        console.warn('Backend connection failed. Please check if the server is running.')
      } else {
        console.error('Auth check failed:', error)
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const { data } = await contextFetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })
      setUser(data.user)
      return data
    } catch (error) {
      throw error
    }
  }

  const signup = async (name, email, password) => {
    try {
      const { data } = await contextFetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      })
      setUser(data.user)
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await contextFetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      setUser(null)
      router.push('/auth/signin')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}