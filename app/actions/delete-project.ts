"use server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase/server"; // Usa tu cliente server-side

export async function deleteProjectAction(id: string, imageUrl?: string) {
  // 1. Elimina la imagen si existe
  if (imageUrl) {
    const match = imageUrl.match(/project-images\/([^?]+)/);
    const filePath = match ? match[1] : null;
    if (filePath) {
      await supabase.storage.from("project-images").remove([filePath]);
    }
  }

  // 2. Elimina el proyecto de la base de datos
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    throw new Error("No se pudo eliminar el proyecto");
  }

  revalidatePath("/"); // Revalida la página principal
}
