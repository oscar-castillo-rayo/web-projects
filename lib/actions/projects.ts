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
    // Listar todos los buckets para verificar si existe
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error al listar buckets:", listError);
      return {
        exists: false,
        error: `Error al verificar buckets: ${listError.message}`,
      };
    }

    // Verificar si el bucket ya existe
    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME);

    return { exists: bucketExists };
  } catch (err) {
    console.error("Error inesperado:", err);
    return {
      exists: false,
      error: `Error inesperado: ${
        err instanceof Error ? err.message : "Desconocido"
      }`,
    };
  }
}

// Subir una imagen a Supabase Storage
export async function uploadProjectImage(file: File): Promise<string> {
  const supabase = createServerSupabaseClient();
  const BUCKET_NAME = "project-images";

  try {
    // Verificar si el bucket existe
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error("Error al listar buckets:", listError);
      throw new Error(`Error al verificar buckets: ${listError.message}`);
    }

    // Verificar si el bucket existe
    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      throw new Error(
        `El bucket '${BUCKET_NAME}' no existe. Por favor, créalo manualmente desde el panel de Supabase.`
      );
    }

    // Generar un nombre único para el archivo
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Subir el archivo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error al subir imagen:", error);
      throw new Error(`No se pudo subir la imagen: ${error.message}`);
    }

    // Obtener la URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error("Error al subir imagen:", err);
    throw err instanceof Error
      ? err
      : new Error("Error desconocido al subir la imagen");
  }
}
