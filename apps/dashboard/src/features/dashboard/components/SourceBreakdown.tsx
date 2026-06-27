'use client'

import { STEPS, SOURCE_COLORS } from '@/features/dashboard/constants'
import { buildPieData, shortStepLabel, sourceStepCount } from '@/features/dashboard/helpers'
import type { SourceBreakdown } from '@/features/dashboard/types'
import SourcePieChart from './SourcePieChart'

interface SourceBreakdownProps {
  source_breakdown: SourceBreakdown
}

const SourceBreakdown = ({ source_breakdown }: SourceBreakdownProps) => {
  const sources = Object.keys(source_breakdown)
  const pieData = buildPieData(sources, source_breakdown)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Traffic Source Breakdown</h2>

      {sources.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No data yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SourcePieChart data={pieData} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Source</th>
                  {STEPS.map((s) => (
                    <th key={s} className="pb-2 font-medium text-center">{shortStepLabel(s)}</th>
                  ))}
                  <th className="pb-2 font-medium text-center text-green-600">CR</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source, i) => {
                  const quizCount = sourceStepCount(source_breakdown, source, 'quiz_start')
                  const buyCount = sourceStepCount(source_breakdown, source, 'buy_click')
                  const cr = quizCount > 0 ? ((buyCount / quizCount) * 100).toFixed(1) + '%' : '—'
                  return (
                    <tr key={source} className="border-b border-gray-50">
                      <td className="py-2 pr-3 font-medium capitalize flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                        />
                        {source}
                      </td>
                      {STEPS.map((s) => (
                        <td key={s} className="py-2 text-center text-gray-600">{sourceStepCount(source_breakdown, source, s)}</td>
                      ))}
                      <td className="py-2 text-center font-semibold text-green-600">{cr}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default SourceBreakdown
