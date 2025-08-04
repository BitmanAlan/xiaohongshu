import { createClient } from '@supabase/supabase-js'

// Safe environment variable access
const getEnvVar = (key: string, fallback: string = '') => {
  // Check if we're in a browser environment with Vite
  if (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback
  }
  
  // Check if we're in a Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback
  }
  
  return fallback
}

// 在客户端，支持多种环境变量命名约定
const supabaseUrl = 
  getEnvVar('VITE_SUPABASE_URL') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnvVar('SUPABASE_URL') ||
  'https://pucdvskpyzzjdqpudnvk.supabase.co'

const supabaseAnonKey = 
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnvVar('SUPABASE_ANON_KEY') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1Y2R2c2tweXp6amRxcHVkbnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDYwOTksImV4cCI6MjA2OTg4MjA5OX0.SuhRQzPYdR_o9nNrb07LwthNnGQYSsNTq3lKYCIutWw'

// Debug logging only in development
if (typeof window !== 'undefined' && typeof console !== 'undefined') {
  console.log('Supabase client config:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    keyPrefix: supabaseAnonKey?.substring(0, 20) + '...'
  })
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)