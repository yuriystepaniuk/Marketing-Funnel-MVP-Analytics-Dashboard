'use client'

import { STEPS, STEP_LABELS } from '@/features/dashboard/constants'
import type { FunnelCounts } from '@/features/dashboard/types'

const COLORS = ['#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5']
const SEG_W = 174
const GAP = 8
const H = 200
const W = STEPS.length * SEG_W + (STEPS.length - 1) * GAP
// remap [0,1] → [0.25,1] so every block has minimum height for text while preserving relative differences
const toDisplay = (r: number) => r > 0 ? 0.25 + r * 0.75 : 0

const topYOf = (ratio: number) => (H / 2) * (1 - ratio)

interface Props {
  funnel: FunnelCounts
}

const FunnelSvgChart = ({ funnel }: Props) => {
  const first = funnel[STEPS[0]] ?? 0
  const ratios = STEPS.map(step => (first > 0 ? (funnel[step] ?? 0) / first : 0))
  const displayRatios = ratios.map(toDisplay)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        {STEPS.map((_, i) => {
          const x1 = i * (SEG_W + GAP)
          const x2 = x1 + SEG_W
          const t1 = topYOf(displayRatios[i])
          const t2 = topYOf(i < STEPS.length - 1 ? displayRatios[i + 1] : displayRatios[i])
          return (
            <clipPath key={i} id={`fsc-${i}`}>
              <polygon points={`${x1},${t1} ${x2},${t2} ${x2},${H - t2} ${x1},${H - t1}`} />
            </clipPath>
          )
        })}
      </defs>

      {STEPS.map((step, i) => {
        const x1 = i * (SEG_W + GAP)
        const x2 = x1 + SEG_W
        const t1 = topYOf(displayRatios[i])
        const t2 = topYOf(i < STEPS.length - 1 ? displayRatios[i + 1] : displayRatios[i])
        const cx = (x1 + x2) / 2
        const pct = Math.round(ratios[i] * 100)
        const segH = H - (t1 + t2)
        const compact = segH < 90

        return (
          <g key={step} clipPath={`url(#fsc-${i})`}>
            <polygon
              points={`${x1},${t1} ${x2},${t2} ${x2},${H - t2} ${x1},${H - t1}`}
              fill={COLORS[i]}
            />
            <text
              x={cx} y={H / 2 - (compact ? 12 : 18)}
              textAnchor="middle" dominantBaseline="middle"
              fill="white" fontWeight="700"
              fontSize={compact ? 20 : 28}
              fontFamily="system-ui,sans-serif"
            >
              {pct}%
            </text>
            <text
              x={cx} y={H / 2 + (compact ? 4 : 6)}
              textAnchor="middle" dominantBaseline="middle"
              fill="rgba(255,255,255,0.8)" fontSize={compact ? 9 : 10}
              fontFamily="system-ui,sans-serif" fontWeight="600"
            >
              {STEP_LABELS[step].toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default FunnelSvgChart
