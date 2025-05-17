import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorageBucket() {
  const { data, error } = await supabase.storage
    .from("project-images")
    .list("");
  if (error) {
    //console.error('Error al conectar al bucket:', error.message);
  } else {
    //console.log('¡Conexión exitosa al bucket! Archivos:', data);
  }
}

testStorageBucket();
