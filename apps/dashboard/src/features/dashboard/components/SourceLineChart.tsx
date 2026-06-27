'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { STEPS, STEP_LABELS, SOURCE_HEX, CHART_TOOLTIP_STYLE } from '@/features/dashboard/constants'
import type { SourceBreakdown } from '@/features/dashboard/types'

interface SourceLineChartProps {
  source_breakdown: SourceBreakdown
}

const SourceLineChart = ({ source_breakdown }: SourceLineChartProps) => {
  const sources = Object.keys(source_breakdown)

  const chartData = useMemo(() =>
    STEPS.map((step) => {
      const point: Record<string, string | number> = { step: STEP_LABELS[step] }
      for (const src of sources) {
        point[src] = source_breakdown[src]?.[step] ?? 0
      }
      return point
    }),
    [source_breakdown, sources]
  )

  if (sources.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Source Performance</h2>
        <p className="text-gray-400 text-center py-8">No data yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Source Performance Across Funnel</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="step" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
          <Legend />
          {sources.map((src, i) => (
            <Line
              key={src}
              type="monotone"
              dataKey={src}
              name={src}
              stroke={SOURCE_HEX[i % SOURCE_HEX.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SourceLineChart
