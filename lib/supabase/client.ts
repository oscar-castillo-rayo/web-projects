"use client"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Crear un singleton para el cliente de Supabase
let supabaseInstance: ReturnType<typeof createBrowserSupabaseClient> | null = null

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan las variables de entorno de Supabase")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

export function getSupabaseBrowser() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserSupabaseClient()
  }
  return supabaseInstance
}
