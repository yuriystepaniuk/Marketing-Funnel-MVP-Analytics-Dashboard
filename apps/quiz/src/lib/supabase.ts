import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Uses the publishable (anon) key — RLS is disabled on our tables so this is safe
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

// Server-side client used only in API routes (never sent to browser)
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey)
