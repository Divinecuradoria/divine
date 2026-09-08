import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// One browser client shared by the pages; missing configuration never crashes rendering.
let client: SupabaseClient | null = null
export function getSupabase(): SupabaseClient | null {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    client = createClient(url, key)
    return client
  } catch {
    return null
  }
}

export const ACCESS_UNAVAILABLE = "O acesso está temporariamente indisponível. Tente novamente em instantes."
