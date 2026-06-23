'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUtmFromSearch, saveUtm, getOrCreateSessionId, getOrCreateAnonymousId, saveFunnelProgress } from '@/lib/funnel'
import { apiTrackEvent } from '@/lib/api'
import { useEmailCapture } from '@/hooks/useEmailCapture'

const EmailForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { email, setEmail, loading, displayError, handleSubmit } = useEmailCapture()
  const [ready] = useState(() =>
    typeof window !== 'undefined' && !!sessionStorage.getItem('funnel_quiz_started')
  )

  useEffect(() => {
    if (!ready) {
      router.replace('/')
      return
    }
    saveFunnelProgress({ step: 'email' })
    const utm = getUtmFromSearch(searchParams.toString())
    if (searchParams.toString()) saveUtm(utm)
    const sessionId = getOrCreateSessionId()
    const anonymousId = getOrCreateAnonymousId()
    apiTrackEvent({ step: 'email_view', session_id: sessionId, anonymous_id: anonymousId, ...utm })
  }, [ready, router, searchParams])

  if (!ready) return null

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-indigo-500 to-purple-600 flex flex-col items-center justify-center px-6 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-6">
            <span className="w-8 h-1.5 bg-white rounded-full" />
            <span className="w-8 h-1.5 bg-white rounded-full" />
            <span className="w-8 h-1.5 bg-white/30 rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Confirm your<br />email address
          </h1>     
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-indigo-900/30">
          <form onSubmit={handleSubmit} noValidate>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              disabled={loading}
              autoComplete="email"
            />
            {displayError && <p className="text-red-500 text-sm mt-2">{displayError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl text-lg transition-all hover:-translate-y-0.5"
            >
              {loading ? 'Saving...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EmailForm
