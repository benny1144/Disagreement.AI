import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import authService from '../features/auth/authService.js'

// Types for TS consumers (DashboardPage.tsx)
export interface AuthUser {
  token: string
  [key: string]: any
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (credentials: any) => Promise<AuthUser>
  logout: () => void
  setUser: (u: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && parsed.token) {
          setUser(parsed)
        } else {
          localStorage.removeItem('user')
        }
      }
    } catch {
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (credentials: any) => {
    const loggedIn = await authService.login(credentials)
    // authService persists to localStorage; keep state in sync
    setUser(loggedIn)
    return loggedIn
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token: user?.token ?? null,
    loading,
    login,
    logout,
    setUser,
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
