'use client'

import { useLogin } from '@/hooks/useLogin'

interface LoginFormProps {
  onSuccess: (token: string) => void
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { username, password, loading, authError, setUsername, setPassword, handleSubmit } = useLogin(onSuccess)

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 flex-col justify-between p-12">
        <div className="text-white text-xl font-bold tracking-tight">Funnel Analytics</div>
        <div>
          <p className="text-indigo-200 text-sm uppercase tracking-widest mb-3">Dashboard</p>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Track every step<br />of your funnel.
          </h2>
          <p className="text-indigo-300 text-base">Real-time insights on quiz starts, email captures, paywall views, and purchases.</p>
        </div>
        <p className="text-indigo-400 text-xs">Marketing Funnel MVP</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl mb-6 lg:hidden" />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
            <p className="text-gray-400 text-sm">Sign in to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
