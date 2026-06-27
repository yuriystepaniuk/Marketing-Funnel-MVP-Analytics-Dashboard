'use client'

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { STEPS, STEP_LABELS, FUNNEL_COLORS, FUNNEL_HEX, CHART_TOOLTIP_STYLE } from '@/features/dashboard/constants'
import type { FunnelCounts } from '@/features/dashboard/types'
import FunnelSvgChart from './FunnelSvgChart'

interface FunnelOverviewProps {
  funnel: FunnelCounts
  maxCount: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function BarShape(props: any) {
  const { x, y, width, height, index } = props
  return (
    <rect
      x={x}
      y={y}
      width={Math.max(width, 0)}
      height={Math.max(height, 0)}
      rx={6}
      ry={6}
      fill={FUNNEL_HEX[index as number] ?? '#6366f1'}
    />
  )
}

const FunnelOverview = ({ funnel }: FunnelOverviewProps) => {
  const chartData = STEPS.map((step) => ({
    name: STEP_LABELS[step],
    count: funnel[step] ?? 0,
  }))

  const worstDrop = useMemo(() => {
    const transitions = STEPS.slice(0, -1).map((step, i) => {
      const curr = funnel[step] ?? 0
      const next = funnel[STEPS[i + 1]] ?? 0
      const pct = curr > 0 ? Math.round(((curr - next) / curr) * 100) : 0
      return {
        from: STEP_LABELS[step],
        to: STEP_LABELS[STEPS[i + 1]],
        pct,
        lost: curr - next,
      }
    })
    return transitions.reduce((a, b) => (b.pct > a.pct ? b : a), transitions[0])
  }, [funnel])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 pt-6 px-6 overflow-hidden flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Funnel Overview</h2>

      {worstDrop && worstDrop.pct > 0 && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-sm">
          <span className="text-red-500 text-base">⚠</span>
          <span className="text-gray-600">Найбільший відтік:</span>
          <span className="font-semibold text-gray-800">{worstDrop.from} → {worstDrop.to}</span>
          <span className="ml-auto font-bold text-red-600">{worstDrop.pct}% втрачено</span>
          <span className="text-gray-400 text-xs">({worstDrop.lost} users)</span>
        </div>
      )}

      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-6">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: `color-mix(in srgb, ${FUNNEL_COLORS[i]} 12%, white)` }}
          >
            <p className="text-2xl font-bold" style={{ color: FUNNEL_COLORS[i] }}>{funnel[step] ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1 leading-tight">{STEP_LABELS[step]}</p>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barCategoryGap="20%" margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(value) => [value, 'Users']} />
          <Bar dataKey="count" shape={BarShape} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4">
        <FunnelSvgChart funnel={funnel} />
      </div>
    </div>
  )
}

export default FunnelOverview
