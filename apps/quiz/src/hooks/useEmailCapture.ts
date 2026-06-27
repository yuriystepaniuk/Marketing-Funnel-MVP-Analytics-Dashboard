import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadUtm, getOrCreateAnonymousId, getOrCreateSessionId } from '@/lib/funnel'
import { apiUpsertUser, apiTrackEvent } from '@/lib/api'
import { useCrud } from '@/hooks/useCrud'
import { validateEmail } from '@/features/funnel/helpers'

export const useEmailCapture = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [validationError, setValidationError] = useState('')

  const { execute: upsertUser, loading, error: apiError } = useCrud(apiUpsertUser)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setValidationError('')

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address.')
      return
    }

    const utm = loadUtm()
    const anonymousId = getOrCreateAnonymousId()
    const result = await upsertUser({ email, anonymous_id: anonymousId, ...utm })
    if (!result) return

    const sessionId = getOrCreateSessionId()
    const userId = result.user.id
    sessionStorage.setItem('funnel_user_id', userId)
    sessionStorage.setItem('funnel_user_email', email.toLowerCase().trim())

    apiTrackEvent({ step: 'email_submit', session_id: sessionId, anonymous_id: anonymousId, user_id: userId, ...utm })

    if (result.purchased) {
      sessionStorage.setItem('funnel_purchase_type', 'returning')
      router.push('/product')
    } else {
      router.push(result.isNew === false ? '/paywall?resumed=true' : '/paywall')
    }
  }

  return {
    email,
    setEmail,
    loading,
    displayError: validationError || apiError,
    handleSubmit,
  }
}
