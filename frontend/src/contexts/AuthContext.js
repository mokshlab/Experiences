'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/api-client'
import { API_BASE_URL } from '@/lib/constants'

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
      const { data } = await apiFetch(`${API_BASE_URL}/auth/me`)
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
      const { data } = await apiFetch(`${API_BASE_URL}/auth/login`, {
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
      const { data } = await apiFetch(`${API_BASE_URL}/auth/register`, {
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
      await apiFetch(`${API_BASE_URL}/auth/logout`, {
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