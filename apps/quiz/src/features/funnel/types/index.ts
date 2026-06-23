export interface UtmParams {
  source: string
  utm_campaign?: string
  utm_medium?: string
  utm_content?: string
  utm_term?: string
}

export interface User {
  id: string
  email: string
  created_at: string
  first_touch_source: string | null
  first_touch_utm_campaign: string | null
  first_touch_utm_medium: string | null
}

export interface UpsertUserPayload extends UtmParams {
  email: string
  anonymous_id: string
}

export interface UpsertUserResult {
  user: User
  isNew: boolean
  purchased?: boolean
}

export interface TrackPayload extends UtmParams {
  step: string
  session_id: string
  anonymous_id: string
  user_id?: string
}
