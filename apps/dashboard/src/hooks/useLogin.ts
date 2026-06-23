import { useState } from 'react'
import { apiAuthDashboard } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'

export const useLogin = (onSuccess: (token: string) => void) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const { execute: authDashboard, loading } = useCrud(apiAuthDashboard)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAuthError('')
    const token = await authDashboard({ username, password })
    if (!token) { setAuthError('Invalid username or password.'); return }
    onSuccess(token)
  }

  return { username, password, loading, authError, setUsername, setPassword, handleSubmit }
}
