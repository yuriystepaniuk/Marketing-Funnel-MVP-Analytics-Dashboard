import { Suspense } from 'react'
import PaywallPage from '@/features/funnel/components/PaywallPage'

export default function Paywall() {
  return (
    <Suspense>
      <PaywallPage />
    </Suspense>
  )
}
