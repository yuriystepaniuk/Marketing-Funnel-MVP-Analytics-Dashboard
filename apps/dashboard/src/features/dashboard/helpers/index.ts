import { STEP_LABELS } from '@/features/dashboard/constants'
import type { SourceBreakdown } from '@/features/dashboard/types'

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const shortStepLabel = (step: string) => STEP_LABELS[step]?.split(' ')[0] ?? step

export const sourceStepCount = (source_breakdown: SourceBreakdown, source: string, step: string) =>
  source_breakdown[source]?.[step] ?? 0

export const buildPieData = (
  sources: string[],
  source_breakdown: SourceBreakdown
) =>
  sources.map((source) => ({
    name: capitalize(source),
    value: Object.values(source_breakdown[source]).reduce((a, b) => a + b, 0),
  }))
