'use client'

import { STEPS, STEP_LABELS, FUNNEL_COLORS } from '@/features/dashboard/constants'
import type { FunnelCounts } from '@/features/dashboard/types'
import FunnelSvgChart from './FunnelSvgChart'

interface FunnelOverviewProps {
  funnel: FunnelCounts
  maxCount: number
}

const FunnelOverview = ({ funnel }: FunnelOverviewProps) => {

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 pt-6 px-6 overflow-hidden flex flex-col">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Funnel Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className="rounded-xl p-4 text-center"
            style={{ backgroundColor: `color-mix(in srgb, ${FUNNEL_COLORS[i]} 12%, white)` }}
          >
            <p className="text-3xl font-bold" style={{ color: FUNNEL_COLORS[i] }}>{funnel[step] ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">{STEP_LABELS[step]}</p>
          </div>
        ))}
      </div>
      <FunnelSvgChart funnel={funnel} />
    </div>
  )
}

export default FunnelOverview
