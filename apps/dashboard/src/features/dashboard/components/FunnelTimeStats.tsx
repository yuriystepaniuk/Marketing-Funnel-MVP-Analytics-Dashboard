'use client'

import type { TimeStats } from '@/features/dashboard/types'

interface FunnelTimeStatsProps {
  stats: TimeStats | null
  loading: boolean
}

const formatMinutes = (mins: number) => {
  if (mins < 1) return `${Math.round(mins * 60)}s`
  if (mins < 60) return `${mins}m`
  return `${(mins / 60).toFixed(1)}h`
}

const FunnelTimeStats = ({ stats, loading }: FunnelTimeStatsProps) => {
  if (!stats && !loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Time to Convert</h2>
        <p className="text-gray-400 text-center py-8">No conversions yet</p>
      </div>
    )
  }

  const cards = stats
    ? [
        { label: 'Average', value: stats.avg_minutes },
        { label: 'Median', value: stats.median_minutes },
        { label: 'Fastest', value: stats.min_minutes },
        { label: 'Slowest', value: stats.max_minutes },
      ]
    : null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Time to Convert</h2>
        {stats && (
          <span className="text-sm text-gray-400">{stats.total_converters} converters</span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards
          ? cards.map(({ label, value }) => (
              <div key={label} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{formatMinutes(value)}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))
          : Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />
            ))}
      </div>

      {stats && (
        <p className="text-xs text-gray-400 mt-4">
          Time from first funnel event to purchase click
        </p>
      )}
    </div>
  )
}

export default FunnelTimeStats
