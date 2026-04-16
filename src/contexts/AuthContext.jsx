import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_PROFILE } from '../lib/mockData'

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'
const PROFILE_CACHE_KEY = 'sr_crm_profile'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(() => {
    // Pre-load cached profile so the spinner disappears immediately on repeat visits
    try {
      const cached = sessionStorage.getItem(PROFILE_CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Safety net: if onAuthStateChange never fires (e.g. network hung), don't stay stuck
    const timeout = setTimeout(() => setLoading(false), 5000)

    // onAuthStateChange fires INITIAL_SESSION immediately from the localStorage cache —
    // calling getSession() on top of this just causes a duplicate fetchProfile call.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        sessionStorage.removeItem(PROFILE_CACHE_KEY)
        setLoading(false)
      }
      clearTimeout(timeout)
    })

    return () => { subscription.unsubscribe(); clearTimeout(timeout) }
  }, [])

  async function fetchProfile(userId) {
    if (isDemoMode) {
      setProfile(MOCK_PROFILE)
      setLoading(false)
      return
    }

    // Serve from cache if the cached profile belongs to this user
    try {
      const cached = sessionStorage.getItem(PROFILE_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.id === userId) {
          setProfile(parsed)
          setLoading(false)
          return
        }
      }
    } catch { /* ignore parse errors */ }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data))
      setProfile(data)
    } catch {
      // Network error or Supabase down — still unblock the app
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    sessionStorage.removeItem(PROFILE_CACHE_KEY)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
