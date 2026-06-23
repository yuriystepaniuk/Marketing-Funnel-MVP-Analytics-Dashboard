'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getUtmFromSearch, saveUtm, getOrCreateSessionId, resetSessionId, getOrCreateAnonymousId, loadFunnelProgress, clearFunnelProgress } from '@/lib/funnel'
import { apiTrackEvent } from '@/lib/api'
import type { FunnelProgress } from '@/lib/funnel'

const QuizStart = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState<FunnelProgress | null>(() => loadFunnelProgress())

  useEffect(() => {
    const utm = getUtmFromSearch(searchParams.toString())
    saveUtm(utm)
    const existing = sessionStorage.getItem('funnel_session_id')
    const sessionId = existing ? getOrCreateSessionId() : resetSessionId()
    const anonymousId = getOrCreateAnonymousId()
    if (!existing) {
      apiTrackEvent({ step: 'quiz_start', session_id: sessionId, anonymous_id: anonymousId, ...utm })
    }
  }, [searchParams])

  const handleContinue = () => {
    sessionStorage.setItem('funnel_quiz_started', '1')
    router.push('/email')
  }

  const handleStartFresh = () => {
    clearFunnelProgress()
    setProgress(null)
    const utm = getUtmFromSearch(searchParams.toString())
    saveUtm(utm)
    const sessionId = resetSessionId()
    const anonymousId = getOrCreateAnonymousId()
    apiTrackEvent({ step: 'quiz_start', session_id: sessionId, anonymous_id: anonymousId, ...utm })
    sessionStorage.setItem('funnel_quiz_started', '1')
    router.push('/email')
  }

  const handleGoToEmail = () => {
    sessionStorage.setItem('funnel_quiz_started', '1')
    router.push('/email')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 via-indigo-500 to-purple-600 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 right-8 w-24 h-24 bg-indigo-400/20 rounded-full" />
      <div className="relative max-w-md w-full text-center pb-28 sm:pb-0">
        <div className="inline-flex items-center gap-2 bg-white/15 text-white/90 text-sm px-4 py-1.5 rounded-full mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Marketing Growth Quiz
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
          Discover Your<br />
          <span className="text-indigo-200">Marketing Superpower</span>
        </h1>
        <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
          Find out which growth strategy fits your business — and get a personalised action plan.
        </p>

        {progress ? (
          <div className="hidden sm:flex flex-col gap-3">
            <button
              onClick={handleContinue}
              className="w-full bg-white hover:bg-indigo-50 text-indigo-700 font-bold py-4 px-8 rounded-2xl text-lg transition-all shadow-lg shadow-indigo-900/30 hover:shadow-xl hover:-translate-y-0.5"
            >
              Continue where you left off →
            </button>
            <button
              onClick={handleStartFresh}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-8 rounded-2xl text-base transition-all"
            >
              Start over
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoToEmail}
            className="hidden sm:block w-full bg-white hover:bg-indigo-50 text-indigo-700 font-bold py-4 px-8 rounded-2xl text-lg transition-all shadow-lg shadow-indigo-900/30 hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Quiz →
          </button>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 p-4 sm:hidden">
        {progress ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleContinue}
              className="w-full bg-white hover:bg-indigo-50 text-indigo-700 font-bold py-4 rounded-2xl text-lg transition-all shadow-lg"
            >
              Continue where you left off →
            </button>
            <button
              onClick={handleStartFresh}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-2xl text-base transition-all"
            >
              Start over
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoToEmail}
            className="w-full bg-white hover:bg-indigo-50 text-indigo-700 font-bold py-4 rounded-2xl text-lg transition-all shadow-lg"
          >
            Start Quiz →
          </button>
        )}
      </div>
    </div>
  )
}

export default QuizStart
