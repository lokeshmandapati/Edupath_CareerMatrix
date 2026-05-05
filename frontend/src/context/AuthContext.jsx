import { createContext, useContext, useMemo, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const STORAGE = {
  token: 'careermatrix_token',
  userId: 'careermatrix_userId',
  name: 'careermatrix_name',
  email: 'careermatrix_email',
  branch: 'careermatrix_branch',
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE.token))
  const [userId, setUserId] = useState(() => localStorage.getItem(STORAGE.userId))
  const [name, setName] = useState(() => localStorage.getItem(STORAGE.name))
  const [email, setEmail] = useState(() => localStorage.getItem(STORAGE.email))
  const [branch, setBranch] = useState(() => localStorage.getItem(STORAGE.branch))

  useEffect(() => {
    if (token) localStorage.setItem(STORAGE.token, token)
    else localStorage.removeItem(STORAGE.token)
  }, [token])

  useEffect(() => {
    if (userId) localStorage.setItem(STORAGE.userId, userId)
    else localStorage.removeItem(STORAGE.userId)
  }, [userId])

  useEffect(() => {
    if (name) localStorage.setItem(STORAGE.name, name)
    else localStorage.removeItem(STORAGE.name)
  }, [name])

  useEffect(() => {
    if (email) localStorage.setItem(STORAGE.email, email)
    else localStorage.removeItem(STORAGE.email)
  }, [email])

  useEffect(() => {
    if (branch) localStorage.setItem(STORAGE.branch, branch)
    else localStorage.removeItem(STORAGE.branch)
  }, [branch])

  const login = (auth) => {
    setToken(auth.token)
    setUserId(String(auth.userId))
    setName(auth.name)
    setEmail(auth.email || '')
    setBranch(auth.branch || null)
  }

  const logout = () => {
    setToken(null)
    setUserId(null)
    setName(null)
    setEmail(null)
    localStorage.removeItem(STORAGE.token)
    localStorage.removeItem(STORAGE.userId)
    localStorage.removeItem(STORAGE.name)
    localStorage.removeItem(STORAGE.email)
    localStorage.removeItem(STORAGE.branch)
    localStorage.removeItem('careermatrix_last_prediction')
  }

  const value = useMemo(
    () => ({
      token,
      userId,
      name,
      email,
      branch,
      setName,
      setEmail,
      setBranch,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, userId, name, email, branch],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
