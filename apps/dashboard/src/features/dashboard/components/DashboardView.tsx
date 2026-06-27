'use client'

import { useState } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import type { DateRange } from '@/lib/api'
import Sidebar from './Sidebar'
import FunnelOverview from './FunnelOverview'
import ConversionRates from './ConversionRates'
import SourceBreakdown from './SourceBreakdown'
import AttributionTable from './AttributionTable'
import FunnelTrend from './FunnelTrend'
import FunnelTimeStats from './FunnelTimeStats'
import Spinner from './Spinner'

interface DashboardViewProps {
  token: string
  onLogout: () => void
}

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: '1H',      value: '1h' },
  { label: 'Today',   value: '24h' },
  { label: '7D',      value: '7d' },
  { label: '30D',     value: '30d' },
  { label: 'All time', value: 'all' },
]

const DashboardView = ({ token, onLogout }: DashboardViewProps) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [source, setSource] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const { data, loading, fetchError, maxCount, allAttribution, hasMore, loadMore, refresh } =
    useDashboardData(token, onLogout, source, dateRange)

  const availableSources = data ? Object.keys(data.source_breakdown) : []

  const filterBar = (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex gap-1">
        {DATE_RANGES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setDateRange(value)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              dateRange === value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {availableSources.length > 0 && (
        <div className="flex items-center gap-2 ml-2">
          <span className="text-xs text-gray-400">Source:</span>
          <select
            value={source ?? ''}
            onChange={(e) => setSource(e.target.value || null)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">All</option>
            {availableSources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {source && (
            <button onClick={() => setSource(null)} className="text-xs text-gray-400 hover:text-gray-600 underline">
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )

  const attributionTable = data && (
    <AttributionTable
      attribution={allAttribution}
      total={data.pagination.total}
      hasMore={hasMore}
      onLoadMore={loadMore}
      loading={loading}
    />
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex">
        <Sidebar active={activeTab} onSelect={setActiveTab} onRefresh={refresh} onLogout={onLogout} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="px-4 md:px-8 py-6">
          {fetchError && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{fetchError}</div>
          )}

          {!data && loading && <Spinner />}

          {data && (
            <div className={`transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              {filterBar}

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FunnelOverview funnel={data.funnel} maxCount={maxCount} />
                    <ConversionRates conversions={data.conversions} />
                  </div>
                  <SourceBreakdown source_breakdown={data.source_breakdown} />
                  {attributionTable}
                </div>
              )}

              {activeTab === 'funnel' && <FunnelOverview funnel={data.funnel} maxCount={maxCount} />}
              {activeTab === 'conversions' && <ConversionRates conversions={data.conversions} />}
              {activeTab === 'sources' && <SourceBreakdown source_breakdown={data.source_breakdown} />}

              {activeTab === 'trends' && (
                <div className="space-y-6">
                  <FunnelTrend data={data.funnel_by_day} />
                </div>
              )}

              {activeTab === 'timing' && (
                <div className="space-y-6">
                  <FunnelTimeStats stats={data.time_stats} loading={loading} />
                </div>
              )}

              {activeTab === 'attribution' && attributionTable}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardView
