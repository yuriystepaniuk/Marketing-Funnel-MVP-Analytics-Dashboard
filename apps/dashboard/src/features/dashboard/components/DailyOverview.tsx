'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CHART_TOOLTIP_STYLE } from '@/features/dashboard/constants'
import type { DailyCount } from '@/features/dashboard/types'

interface DailyOverviewProps {
  data: DailyCount[]
}

const DailyOverview = ({ data }: DailyOverviewProps) => {
  const chartData = useMemo(() => {
    const days = [...new Set(data.map((d) => d.day))].sort()
    return days.map((day) => {
      const sessions = data.find((d) => d.day === day && d.step === 'quiz_start')?.cnt ?? 0
      const purchases = data.find((d) => d.day === day && d.step === 'buy_click')?.cnt ?? 0
      const label = day.includes(' ') ? day.slice(8) : day.slice(5)
      return { day: label, Sessions: sessions, Purchases: purchases }
    })
  }, [data])

  if (chartData.length === 0) return null

  const totalSessions = chartData.reduce((s, d) => s + d.Sessions, 0)
  const totalPurchases = chartData.reduce((s, d) => s + d.Purchases, 0)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
        <div className="flex gap-4 text-sm text-gray-500">
          <span><span className="font-bold text-indigo-600">{totalSessions.toLocaleString()}</span> sessions</span>
          <span><span className="font-bold text-emerald-600">{totalPurchases.toLocaleString()}</span> purchases</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradPurchases" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Area type="monotone" dataKey="Sessions" stroke="#6366f1" strokeWidth={2} fill="url(#gradSessions)" />
          <Area type="monotone" dataKey="Purchases" stroke="#10b981" strokeWidth={2} fill="url(#gradPurchases)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default DailyOverview
