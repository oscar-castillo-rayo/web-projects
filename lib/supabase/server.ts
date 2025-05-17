import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import "dotenv/config";

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Faltan las variables de entorno de Supabase");
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}
