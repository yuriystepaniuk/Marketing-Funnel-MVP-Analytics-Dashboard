'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboard } from '@/hooks/useDashboard'
import LoginForm from '@/features/dashboard/components/LoginForm'
import Spinner from '@/features/dashboard/components/Spinner'

export default function LoginPage() {
  const { token, login } = useDashboard()
  const router = useRouter()

  useEffect(() => {
    if (token) router.replace('/')
  }, [token, router])

  if (token === null || token) return <Spinner />

  const handleSuccess = (t: string) => {
    login(t)
    router.push('/')
  }

  return <LoginForm onSuccess={handleSuccess} />
}
