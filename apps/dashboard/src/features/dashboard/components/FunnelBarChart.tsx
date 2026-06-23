'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CHART_TOOLTIP_STYLE } from '@/features/dashboard/constants'

interface FunnelBarChartEntry {
  name: string
  value: number
  color: string
}

interface FunnelBarChartProps {
  data: FunnelBarChartEntry[]
}

const FunnelBarChart = ({ data }: FunnelBarChartProps) => (
  <ResponsiveContainer width="100%" className="flex-1" height="99%">
    <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} cursor={{ fill: '#f3f4f6' }} />
      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
        {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
)

export default FunnelBarChart
