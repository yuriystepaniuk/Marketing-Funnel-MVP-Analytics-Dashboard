'use client'

import { useDashboard } from '@/hooks/useDashboard'
import LoginForm from '@/features/dashboard/components/LoginForm'
import DashboardView from '@/features/dashboard/components/DashboardView'
import Spinner from '@/features/dashboard/components/Spinner'

const DashboardPage = () => {
  const { token, login, logout } = useDashboard()

  if (token === null) return <Spinner />

  return !token
    ? <LoginForm onSuccess={login} />
    : <DashboardView token={token} onLogout={logout} />
}

export default DashboardPage
