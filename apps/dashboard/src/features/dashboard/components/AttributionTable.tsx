'use client'

import { useEffect, useRef } from 'react'
import type { AttributionRow } from '@/features/dashboard/types'

interface AttributionTableProps {
  attribution: AttributionRow[]
  total: number
  hasMore: boolean
  onLoadMore: () => void
  loading: boolean
}

const AttributionTable = ({ attribution, total, hasMore, onLoadMore, loading }: AttributionTableProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onLoadMore() },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onLoadMore])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">User Overview</h2>
        {total > 0 && <span className="text-sm text-gray-400">{total} users total</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-3 pr-4 font-medium">Email</th>
              <th className="pb-3 pr-4 font-medium">Purchased</th>
              <th className="pb-3 pr-4 font-medium">Funnel Time</th>
              <th className="pb-3 pr-4 font-medium">Product</th>
              <th className="pb-3 pr-4 font-medium">First Touch</th>
              <th className="pb-3 pr-4 font-medium">Last Touch</th>
              <th className="pb-3 pr-4 font-medium">Campaign</th>
              <th className="pb-3 pr-4 font-medium">Joined</th>
              <th className="pb-3 font-medium">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {attribution.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 pr-4 text-gray-800">{row.email}</td>
                <td className="py-3 pr-4">
                  {row.purchased
                    ? <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Purchased</span>
                    : <span className="text-gray-300 text-xs">—</span>
                  }
                </td>
                <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">
                  {row.funnel_minutes !== null
                    ? row.funnel_minutes < 60
                      ? `${row.funnel_minutes}m`
                      : `${Math.floor(row.funnel_minutes / 60)}h ${row.funnel_minutes % 60}m`
                    : '—'}
                </td>
                <td className="py-3 pr-4">
                  {row.product_visited
                    ? <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">Visited</span>
                    : <span className="text-gray-300 text-xs">—</span>
                  }
                </td>
                <td className="py-3 pr-4">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full capitalize">
                    {row.first_touch}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                    row.first_touch === row.last_touch
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {row.last_touch}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-500 text-xs">{row.first_touch_campaign ?? '—'}</td>
                <td className="py-3 pr-4 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(row.created_at).toLocaleString()}
                </td>
                <td className="py-3 text-gray-400 text-xs whitespace-nowrap">
                  {row.last_seen_at ? new Date(row.last_seen_at).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
            {attribution.length === 0 && !loading && (
              <tr><td colSpan={9} className="py-4 text-gray-400 text-center">No users yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div ref={sentinelRef} className="h-4 mt-2" />
      {loading && (
        <p className="text-center text-sm text-gray-400 py-2">Loading…</p>
      )}
      {!hasMore && attribution.length > 0 && (
        <p className="text-center text-xs text-gray-300 py-2">All {total} users loaded</p>
      )}
    </div>
  )
}

export default AttributionTable
