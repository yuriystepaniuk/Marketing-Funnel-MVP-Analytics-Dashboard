import { CONVERSIONS, OVERALL_CONVERSION_KEY, OVERALL_CONVERSION_LABEL } from '@/features/dashboard/constants'
import type { ConversionRates } from '@/features/dashboard/types'

const TIER_STYLES = [
  { bg: 'bg-green-50', text: 'text-green-700' },
  { bg: 'bg-yellow-50', text: 'text-yellow-600' },
  { bg: 'bg-red-50',   text: 'text-red-600'   },
]

interface ConversionRatesProps {
  conversions: ConversionRates
}

const ConversionRates = ({ conversions }: ConversionRatesProps) => {
  const values = CONVERSIONS.map(({ key }) => parseFloat(conversions[key] ?? '0'))
  const sorted = [...values].sort((a, b) => b - a)
  const tierOf = (val: number) => sorted.indexOf(val)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Conversion Rates</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-50 rounded-xl p-4 text-center h-36 flex flex-col items-center justify-center">
          <p className="text-4xl font-bold text-indigo-700">{conversions[OVERALL_CONVERSION_KEY]}%</p>
          <p className="text-sm text-gray-500 mt-1">{OVERALL_CONVERSION_LABEL}</p>
        </div>
        {CONVERSIONS.map(({ label, key }, i) => {
          const { bg, text } = TIER_STYLES[tierOf(values[i])]
          return (
            <div key={key} className={`${bg} rounded-xl p-4 text-center h-36 flex flex-col items-center justify-center`}>
              <p className={`text-4xl font-bold ${text}`}>{conversions[key]}%</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}


export default ConversionRates
