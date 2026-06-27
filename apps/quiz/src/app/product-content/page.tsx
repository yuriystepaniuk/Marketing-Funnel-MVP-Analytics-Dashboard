'use client'

import { useEffect } from 'react'
import { apiTrackEvent, apiTrackBeacon } from '@/lib/api'
import { getOrCreateAnonymousId, getOrCreateSessionId, loadUtm } from '@/lib/funnel'

const PING_INTERVAL_MS = 30_000

const ProductContentPage = () => {
  useEffect(() => {
    const userId = sessionStorage.getItem('funnel_user_id') ?? undefined
    const anonymousId = getOrCreateAnonymousId()
    const sessionId = getOrCreateSessionId()
    const utm = loadUtm()
    const base = { session_id: sessionId, anonymous_id: anonymousId, user_id: userId, ...utm }

    apiTrackEvent({ step: 'product_view', ...base })

    const pingId = setInterval(() => {
      apiTrackEvent({ step: 'product_ping', ...base })
    }, PING_INTERVAL_MS)

    const handleHide = () => {
      if (document.visibilityState === 'hidden') {
        apiTrackBeacon({ step: 'product_exit', ...base })
      }
    }
    document.addEventListener('visibilitychange', handleHide)

    return () => {
      clearInterval(pingId)
      document.removeEventListener('visibilitychange', handleHide)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="2.5">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">GrowthLab</span>
          <span className="ml-auto text-xs bg-indigo-50 text-indigo-700 font-medium px-3 py-1 rounded-full">Pro Member</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Marketing Growth Plan</h1>
          <p className="text-gray-500 mb-6">Personalized 90-day roadmap based on your quiz results</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { week: 'Week 1–2', title: 'Foundation', color: 'indigo', items: ['Audit current channels', 'Set up tracking', 'Define KPIs'] },
              { week: 'Week 3–6', title: 'Growth Sprint', color: 'violet', items: ['Launch paid campaigns', 'A/B test creatives', 'Build email sequences'] },
              { week: 'Week 7–12', title: 'Scale', color: 'purple', items: ['Double down on winners', 'Automate workflows', 'Expand to new channels'] },
            ].map((phase) => (
              <div key={phase.week} className={`bg-${phase.color}-50 rounded-xl p-5`}>
                <p className={`text-xs font-semibold text-${phase.color}-500 uppercase tracking-wider mb-1`}>{phase.week}</p>
                <p className={`font-bold text-${phase.color}-900 text-lg mb-3`}>{phase.title}</p>
                <ul className="space-y-1.5">
                  {phase.items.map((item) => (
                    <li key={item} className={`flex items-center gap-2 text-sm text-${phase.color}-800`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-${phase.color}-400 flex-shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Ready-to-Use Templates</h2>
            <ul className="space-y-3">
              {[
                { name: 'Facebook Ad Copy Pack', count: '12 templates' },
                { name: 'Email Welcome Sequence', count: '5 emails' },
                { name: 'Landing Page Framework', count: '3 layouts' },
                { name: 'Analytics Dashboard', count: 'Notion template' },
              ].map((t) => (
                <li key={t.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{t.name}</span>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{t.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Upcoming Coaching Calls</h2>
            <ul className="space-y-3">
              {[
                { date: 'Mon, Jul 7', time: '10:00 AM', topic: 'Onboarding & Goal Setting' },
                { date: 'Mon, Jul 14', time: '10:00 AM', topic: 'Campaign Setup Review' },
                { date: 'Mon, Jul 21', time: '10:00 AM', topic: 'Metrics & Optimization' },
              ].map((call) => (
                <li key={call.date} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                  <div className="text-center min-w-[52px]">
                    <p className="text-xs text-gray-400">{call.date.split(',')[0]}</p>
                    <p className="text-sm font-bold text-indigo-600">{call.date.split(', ')[1]}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{call.topic}</p>
                    <p className="text-xs text-gray-400">{call.time} UTC</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-2xl p-6 text-white">
          <h2 className="font-bold text-xl mb-2">Community Access</h2>
          <p className="text-indigo-200 mb-4 text-sm">Join 1,200+ marketers sharing wins, feedback, and growth strategies.</p>
          <button className="bg-white text-indigo-700 font-semibold px-5 py-2 rounded-xl text-sm hover:bg-indigo-50 transition-colors">
            Join Slack Community →
          </button>
        </div>
      </main>
    </div>
  )
}

export default ProductContentPage
