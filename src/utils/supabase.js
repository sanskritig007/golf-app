import { createClient } from '@supabase/supabase-js'

const envSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const envSupabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

const hasValidSupabaseUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(envSupabaseUrl)
const hasValidSupabaseKey =
  envSupabaseKey.startsWith('eyJ') || envSupabaseKey.startsWith('sb_publishable_')

export const isSupabaseConfigured = hasValidSupabaseUrl && hasValidSupabaseKey

const supabaseUrl = isSupabaseConfigured ? envSupabaseUrl : 'https://mock.supabase.co'
const supabaseKey = isSupabaseConfigured ? envSupabaseKey : 'mock_key'

export const supabase = createClient(supabaseUrl, supabaseKey)
