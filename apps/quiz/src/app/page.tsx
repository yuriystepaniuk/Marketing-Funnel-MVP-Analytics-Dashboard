import { Suspense } from 'react'
import QuizStart from '@/features/funnel/components/QuizStart'

export default function Home() {
  return (
    <Suspense>
      <QuizStart />
    </Suspense>
  )
}
