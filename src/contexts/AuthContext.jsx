import { createContext, useContext, useState } from 'react'

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD
const AUTH_KEY = 'sr_crm_authed'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === 'true')

  function signIn(password) {
    if (password === APP_PASSWORD) {
      localStorage.setItem(AUTH_KEY, 'true')
      setAuthed(true)
      return { error: null }
    }
    return { error: { message: 'Incorrect password. Please try again.' } }
  }

  function signOut() {
    localStorage.removeItem(AUTH_KEY)
    setAuthed(false)
  }

  // Expose user as a non-null object when authed so existing checks (if !user) still work
  return (
    <AuthContext.Provider value={{ user: authed ? {} : null, loading: false, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
