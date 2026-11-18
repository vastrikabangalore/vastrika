import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [role, setRole] = useState({ userId: null, value: null })
  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!userId) return undefined
    let active = true
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (!active) return
      setRole({ userId, value: error ? 'error' : data ? 'admin' : 'denied' })
    })
    return () => {
      active = false
    }
  }, [userId])

  const value = useMemo(() => {
    let status = 'loading'
    if (session === null) status = 'signedOut'
    else if (session && role.userId === userId) status = role.value
    return {
      status,
      user: session?.user ?? null,
      signOut: () => supabase.auth.signOut(),
    }
  }, [session, role, userId])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
