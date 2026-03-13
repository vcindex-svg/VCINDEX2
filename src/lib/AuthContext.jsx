import React, { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  // kept for interface compatibility with App.jsx
  const [isLoadingPublicSettings] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapUser(session.user))
        setIsAuthenticated(true)
      }
      setIsLoadingAuth(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapUser(session.user))
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAuthenticated(false)
    if (shouldRedirect) window.location.href = '/'
  }

  const navigateToLogin = () => {
    window.location.href = `/Login?redirect=${encodeURIComponent(window.location.href)}`
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings: null,
      logout,
      navigateToLogin,
      checkAppState: () => {},
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapUser(supabaseUser) {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    full_name: supabaseUser.user_metadata?.full_name ?? '',
    avatar_url: supabaseUser.user_metadata?.avatar_url ?? '',
    role: supabaseUser.user_metadata?.role ?? 'user',
    ...supabaseUser.user_metadata,
  }
}
