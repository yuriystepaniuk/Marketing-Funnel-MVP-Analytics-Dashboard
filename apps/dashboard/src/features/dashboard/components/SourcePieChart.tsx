'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { SOURCE_COLORS, CHART_TOOLTIP_STYLE } from '@/features/dashboard/constants'

interface PieEntry {
  name: string
  value: number
}

interface SourcePieChartProps {
  data: PieEntry[]
}

const SourcePieChart = ({ data }: SourcePieChartProps) => (
  <ResponsiveContainer width="100%" height={220}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={60}
        outerRadius={90}
        paddingAngle={3}
        dataKey="value"
      >
        {data.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
      </Pie>
      <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
      <Legend iconType="circle" iconSize={8} />
    </PieChart>
  </ResponsiveContainer>
)

export default SourcePieChart
