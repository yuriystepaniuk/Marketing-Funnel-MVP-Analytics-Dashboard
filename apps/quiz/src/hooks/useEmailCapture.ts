import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadUtm, getOrCreateAnonymousId } from '@/lib/funnel'
import { apiUpsertUser } from '@/lib/api'
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

    sessionStorage.setItem('funnel_user_id', result.user.id)
    sessionStorage.setItem('funnel_user_email', email.toLowerCase().trim())

    if (result.purchased) {
      router.push('/product')
    } else {
      router.push('/paywall')
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
