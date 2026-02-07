import { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { authAPI } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    try {
      const res = await authAPI.me()
      setUser(res.data.user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const loginUser = async (data) => {
    const res = await authAPI.login(data)
    setUser(res.data.user)
    return res.data
  }

  const signupUser = async (data) => {
    const res = await authAPI.signup(data)
    setUser(res.data.user)
    return res.data
  }

  const logoutUser = async () => {
    await authAPI.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, signupUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be inside AuthProvider')
  return context
}