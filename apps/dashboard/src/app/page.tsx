'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboard } from '@/hooks/useDashboard'
import DashboardView from '@/features/dashboard/components/DashboardView'
import Spinner from '@/features/dashboard/components/Spinner'

export default function DashboardPage() {
  const { token, logout } = useDashboard()
  const router = useRouter()

  useEffect(() => {
    if (token === '') router.replace('/login')
  }, [token, router])

  if (!token) return <Spinner />

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return <DashboardView token={token} onLogout={handleLogout} />
}
