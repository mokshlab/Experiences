'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_BASE_URL } from '@/lib/constants'

/**
 * Authentication Context Provider
 * 
 * Manages user authentication state across the application
 * 
 * Features:
 * - httpOnly cookie-based authentication (XSS protection)
 * - Automatic token validation on mount
 * - Login, signup, and logout functionality
 * 
 * Security:
 * - Token stored in httpOnly cookie (XSS protection)
 * - Automatic logout on invalid token
 * - Credentials sent with every request
 * - sameSite: strict in production (CSRF protection)
 */

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
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: 'include', // Send httpOnly cookie with request
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      // Network error (backend down, no internet, etc.)
      // This is expected and handled gracefully - user will see error boundaries on protected pages
      if (error.message.includes('fetch')) {
        console.warn('Backend connection failed. Please check if the server is running.')
      } else {
        console.error('Auth check failed:', error)
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * User Login
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Send and receive cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await response.json()
      setUser(data.user)
      return data
    } catch (error) {
      throw error
    }
  }

  /**
   * User Registration
   * @param {string} name - User's full name
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const signup = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include', // Send and receive cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Signup failed')
      }

      const data = await response.json()
      setUser(data.user)
      return data
    } catch (error) {
      throw error
    }
  }

  /**
   * User Logout
   * Calls backend to clear httpOnly cookie and resets local state
   */
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Send cookie to be cleared
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