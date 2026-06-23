'use client'

import { useState } from 'react'
import { useDashboardData } from '@/hooks/useDashboardData'
import Sidebar from './Sidebar'
import FunnelOverview from './FunnelOverview'
import ConversionRates from './ConversionRates'
import SourceBreakdown from './SourceBreakdown'
import AttributionTable from './AttributionTable'
import Spinner from './Spinner'

interface DashboardViewProps {
  token: string
  onLogout: () => void
}

const DashboardView = ({ token, onLogout }: DashboardViewProps) => {
  const [activeTab, setActiveTab] = useState('overview')
  const { data, loading, fetchError, maxCount, allAttribution, hasMore, loadMore, refresh } = useDashboardData(token, onLogout)

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
        <Sidebar
          active={activeTab}
          onSelect={setActiveTab}
          onRefresh={refresh}
          onLogout={onLogout}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="px-4 md:px-8 py-6">
{fetchError && (
            <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{fetchError}</div>
          )}

          {!data && loading && <Spinner />}

          {data && (
            <div className={`transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}>
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
              {activeTab === 'attribution' && attributionTable}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardView
