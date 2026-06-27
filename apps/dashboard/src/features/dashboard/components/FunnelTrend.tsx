'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { STEPS, STEP_LABELS, CHART_TOOLTIP_STYLE } from '@/features/dashboard/constants'
import type { DailyCount } from '@/features/dashboard/types'

const LINE_COLORS = ['#c7d2fe', '#818cf8', '#4f46e5', '#22c55e'] as const

interface FunnelTrendProps {
  data: DailyCount[]
}

const FunnelTrend = ({ data }: FunnelTrendProps) => {
  const chartData = useMemo(() => {
    const days = [...new Set(data.map((d) => d.day))].sort()
    return days.map((day) => {
      // 'YYYY-MM-DD' → 'MM-DD', 'YYYY-MM-DD HH:MM' → 'DD HH:MM'
      const label = day.includes(' ') ? day.slice(8) : day.slice(5)
      const point: Record<string, string | number> = { day: label }
      for (const step of STEPS) {
        const found = data.find((d) => d.day === day && d.step === step)
        point[step] = found?.cnt ?? 0
      }
      return point
    })
  }, [data])

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Trends</h2>
        <p className="text-gray-400 text-center py-8">No data yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Daily Trends (last 30 days)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value, name) => [value, STEP_LABELS[name as string] ?? name]}
          />
          <Legend formatter={(value) => STEP_LABELS[value] ?? value} />
          {STEPS.map((step, i) => (
            <Line
              key={step}
              type="monotone"
              dataKey={step}
              stroke={LINE_COLORS[i]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FunnelTrend
