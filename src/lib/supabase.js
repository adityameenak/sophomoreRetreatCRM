import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mockSupabase'

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

let supabaseClient

if (isDemoMode) {
  supabaseClient = mockSupabase
} else {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Copy .env.example to .env and fill in your credentials, or set VITE_DEMO_MODE=true to preview with mock data.'
    )
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseClient
