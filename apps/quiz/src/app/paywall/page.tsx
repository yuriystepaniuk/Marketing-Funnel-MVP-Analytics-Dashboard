'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { loadUtm, getOrCreateSessionId, getOrCreateAnonymousId, saveFunnelProgress, clearFunnelProgress } from '@/lib/funnel'
import { apiTrackEvent } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import { PAYWALL_FEATURES } from '@/features/funnel/constants'

const PaywallPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { execute: trackBuy, loading } = useCrud(apiTrackEvent)
  const [ready] = useState(() =>
    typeof window !== 'undefined' && !!sessionStorage.getItem('funnel_user_id')
  )
  const [userEmail] = useState(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('funnel_user_email') ?? '' : ''
  )
  const resumed = searchParams.get('resumed') === 'true'

  useEffect(() => {
    if (!ready) {
      router.replace('/')
      return
    }
    const utm = loadUtm()
    const sessionId = getOrCreateSessionId()
    const anonymousId = getOrCreateAnonymousId()
    const userId = sessionStorage.getItem('funnel_user_id') ?? undefined
    saveFunnelProgress({ step: 'paywall' })
    apiTrackEvent({ step: 'paywall_view', session_id: sessionId, anonymous_id: anonymousId, user_id: userId, ...utm })
  }, [ready, router])

  if (!ready) return null

  const handleBuy = async () => {
    const utm = loadUtm()
    const sessionId = getOrCreateSessionId()
    const anonymousId = getOrCreateAnonymousId()
    const userId = sessionStorage.getItem('funnel_user_id') ?? undefined
    await trackBuy({ step: 'buy_click', session_id: sessionId, anonymous_id: anonymousId, user_id: userId, ...utm })
    clearFunnelProgress()
    router.push('/product')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-indigo-500 to-purple-600 flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">

      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-sm">

        <div className="text-center mb-5">
          <div className="flex justify-center gap-2 mb-5">
            <span className="w-8 h-1.5 bg-white rounded-full" />
            <span className="w-8 h-1.5 bg-white rounded-full" />
            <span className="w-8 h-1.5 bg-white rounded-full" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Unlock Your Growth Plan
          </h1>
          <p className="text-indigo-200 text-sm">Everything you need to grow faster.</p>
          {resumed && (
            <div className="mt-4 bg-white/15 backdrop-blur-sm text-white text-sm px-4 py-2.5 rounded-xl">
              You're one step away — complete your purchase to get access.
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-900/30 overflow-hidden">

          <div className="bg-indigo-50 px-6 pt-6 pb-5 text-center">
            <p className="text-5xl font-black text-gray-900">
              $29<span className="text-lg font-normal text-gray-400">/mo</span>
            </p>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">What&apos;s included</p>
            <div className="space-y-3.5 mb-6">
              {PAYWALL_FEATURES.map((label) => (
                <div key={label} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-indigo-500 shrink-0" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6.5 10l2.5 2.5 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-gray-700 text-sm">{label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleBuy}
              disabled={loading}
              className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-full text-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-indigo-200"
            >
              {loading ? 'Processing...' : 'Buy'}
            </button>

            {userEmail && (
              <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                <span>Paying as <span className="text-gray-600 font-medium">{userEmail}</span></span>
                <button
                  onClick={() => {
                    sessionStorage.setItem('funnel_quiz_started', '1')
                    router.push('/email')
                  }}
                  className="cursor-pointer text-indigo-500 hover:text-indigo-700 underline underline-offset-2"
                >
                  Not you?
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default PaywallPage
