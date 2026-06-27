export const STEPS = ['quiz_start', 'email_view', 'paywall_view', 'buy_click'] as const
export type FunnelStep = (typeof STEPS)[number]

export const STEP_LABELS: Record<string, string> = {
  quiz_start: 'Quiz View',
  email_view: 'Email View',
  paywall_view: 'Paywall View',
  buy_click: 'Buy Click',
}

export enum DashboardError {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FETCH_FAILED = 'Failed to load data',
}

export const CONVERSIONS = [
  { label: 'Start → Email', key: 'start_to_email' },
  { label: 'Email → Paywall', key: 'email_to_paywall' },
  { label: 'Paywall → Buy', key: 'paywall_to_buy' },
] as const

export const OVERALL_CONVERSION_KEY = 'overall'
export const OVERALL_CONVERSION_LABEL = 'Overall Conversion'

export const FUNNEL_COLORS = [
  'var(--color-indigo-200)',
  'var(--color-indigo-300)',
  'var(--color-indigo-500)',
  'var(--color-indigo-700)',
] as const

export const FUNNEL_HEX = ['#c7d2fe', '#a5b4fc', '#6366f1', '#3730a3'] as const

export const SOURCE_COLORS = [
  'var(--color-indigo-500)',
  'var(--color-amber-500)',
  'var(--color-emerald-500)',
  'var(--color-red-500)',
  'var(--color-violet-500)',
  'var(--color-cyan-500)',
] as const

export const SOURCE_HEX = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'] as const

export const CHART_TOOLTIP_STYLE = {
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
} as const
