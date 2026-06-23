import { useState, useEffect } from 'react'

export const useDashboard = () => {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(sessionStorage.getItem('dashboard_token') ?? '')
  }, [])

  const login = (t: string) => {
    sessionStorage.setItem('dashboard_token', t)
    setToken(t)
  }

  const logout = () => {
    sessionStorage.removeItem('dashboard_token')
    setToken('')
  }

  return { token, login, logout }
}
