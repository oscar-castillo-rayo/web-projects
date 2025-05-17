"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProjectWithTechnologies } from "@/lib/database.types";

// Obtener todos los proyectos con sus tecnologías
export async function getProjects(): Promise<ProjectWithTechnologies[]> {
  const supabase = createServerSupabaseClient();

  // Obtener todos los proyectos
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener proyectos:", error);
    return [];
  }

  // Para cada proyecto, obtener sus tecnologías
  const projectsWithTechnologies = await Promise.all(
    projects.map(async (project) => {
      const { data: projectTechnologies, error: techError } = await supabase
        .from("project_technologies")
        .select("technology_id")
        .eq("project_id", project.id);

      if (techError) {
        console.error("Error al obtener tecnologías del proyecto:", techError);
        return { ...project, technologies: [] };
      }

      if (projectTechnologies.length === 0) {
        return { ...project, technologies: [] };
      }

      const technologyIds = projectTechnologies.map((pt) => pt.technology_id);

      const { data: technologies, error: techDataError } = await supabase
        .from("technologies")
        .select("*")
        .in("id", technologyIds);

      if (techDataError) {
        console.error("Error al obtener datos de tecnologías:", techDataError);
        return { ...project, technologies: [] };
      }

      return { ...project, technologies: technologies || [] };
    })
  );

  return projectsWithTechnologies;
}

// Crear un nuevo proyecto con sus tecnologías
export async function createProject(formData: FormData) {
  const supabase = createServerSupabaseClient();

  // Extraer datos del formulario
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const demoUrl = formData.get("demoUrl") as string;
  const repoUrl = formData.get("repoUrl") as string;
  const technologiesJson = formData.get("technologies") as string;
  const technologies = JSON.parse(technologiesJson) as string[];

  // Insertar el proyecto
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      title,
      description,
      image_url: imageUrl,
      demo_url: demoUrl || null,
      repo_url: repoUrl || null,
    })
    .select()
    .single();

  if (projectError) {
    console.error("Error al crear proyecto:", projectError);
    throw new Error("No se pudo crear el proyecto");
  }

  // Procesar tecnologías
  if (technologies.length > 0) {
    // Para cada tecnología, verificar si existe o crearla
    for (const techName of technologies) {
      // Buscar si la tecnología ya existe
      const { data: existingTech, error: techFindError } = await supabase
        .from("technologies")
        .select("id")
        .eq("name", techName)
        .maybeSingle();

      let technologyId: string;

      if (techFindError) {
        console.error("Error al buscar tecnología:", techFindError);
        continue;
      }

      // Si la tecnología no existe, crearla
      if (!existingTech) {
        const { data: newTech, error: techCreateError } = await supabase
          .from("technologies")
          .insert({ name: techName })
          .select()
          .single();

        if (techCreateError) {
          console.error("Error al crear tecnología:", techCreateError);
          continue;
        }

        technologyId = newTech.id;
      } else {
        technologyId = existingTech.id;
      }

      // Crear la relación entre proyecto y tecnología
      const { error: relationError } = await supabase
        .from("project_technologies")
        .insert({
          project_id: project.id,
          technology_id: technologyId,
        });

      if (relationError) {
        console.error(
          "Error al crear relación proyecto-tecnología:",
          relationError
        );
      }
    }
  }

  revalidatePath("/");
  redirect("/");
}

// Verificar si el bucket existe (sin intentar crearlo)
export async function checkStorageBucket(): Promise<{
  exists: boolean;
  error?: string;
}> {
  const supabase = createServerSupabaseClient();
  const BUCKET_NAME = "project-images";

  try {
    // Intenta listar archivos en el bucket
    const { data, error } = await supabase.storage.from(BUCKET_NAME).list("");
    if (error) {
      return { exists: false, error: error.message };
    }
    return { exists: true };
  } catch (err) {
    return {
      exists: false,
      error: err instanceof Error ? err.message : "Desconocido",
    };
  }
}

// Subir una imagen a Supabase Storage
export async function uploadProjectImage(
  file: File,
  previousImageUrl?: string
): Promise<string> {
  const supabase = createServerSupabaseClient();
  const BUCKET_NAME = "project-images";

  // 1. Elimina la imagen anterior si existe
  if (previousImageUrl) {
    console.log("Eliminando imagen anterior:", previousImageUrl);
    // Extrae la ruta relativa al bucket después de 'project-images/'
    const match = previousImageUrl.match(/project-images\/(.+)$/);
    const filePath = match ? match[1] : null;
    if (filePath) {
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    }
  }

  // 2. Sube la nueva imagen
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`No se pudo subir la imagen: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    throw err instanceof Error
      ? err
      : new Error("Error desconocido al subir la imagen");
  }
}

export async function getProjectById(id: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "*, technologies:project_technologies(technology:technologies(name))"
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return {
    ...data,
    technologies: data.technologies?.map((t: any) => t.technology) ?? [],
  };
}

export async function updateProject(id: string, updates: any) {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
}

export async function updateProjectTechnologies(
  projectId: string,
  technologies: string[]
) {
  const supabase = createServerSupabaseClient();

  // 1. Elimina las relaciones actuales
  await supabase
    .from("project_technologies")
    .delete()
    .eq("project_id", projectId);

  if (technologies.length === 0) return;

  // 2. Busca los IDs de las tecnologías por nombre
  const { data: techRows, error } = await supabase
    .from("technologies")
    .select("id, name")
    .in("name", technologies);

  if (error) throw error;

  // 3. Encuentra las tecnologías que faltan
  const existingNames = techRows.map((t) => t.name);
  const missingNames = technologies.filter(
    (name) => !existingNames.includes(name)
  );

  // 4. Inserta las tecnologías faltantes
  let newTechRows: { id: string; name: string }[] = [];
  if (missingNames.length > 0) {
    const { data: newTechs, error: insertError } = await supabase
      .from("technologies")
      .insert(missingNames.map((name) => ({ name })))
      .select("id, name");

    if (insertError) throw insertError;
    newTechRows = newTechs;
  }

  // 5. Junta todas las tecnologías (viejas y nuevas)
  const allTechs = [...techRows, ...newTechRows];

  // 6. Inserta las nuevas relaciones usando technology_id
  const inserts = allTechs.map((tech) => ({
    project_id: projectId,
    technology_id: tech.id,
  }));

  if (inserts.length > 0) {
    await supabase.from("project_technologies").insert(inserts);
  }
}
