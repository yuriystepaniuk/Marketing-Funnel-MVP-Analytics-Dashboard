export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type FunnelCounts = Record<string, number>
export type ConversionRates = Record<string, string>
export type SourceBreakdown = Record<string, Record<string, number>>

export interface AttributionRow {
  id: string
  email: string
  first_touch: string
  first_touch_campaign: string | null
  last_touch: string
  created_at: string
  last_seen_at: string | null
  purchased: boolean
}

export interface DashboardData {
  funnel: FunnelCounts
  conversions: ConversionRates
  source_breakdown: SourceBreakdown
  attribution: AttributionRow[]
  pagination: Pagination
}
