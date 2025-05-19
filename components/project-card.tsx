"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, ExternalLink } from "lucide-react";
import { SiGithub } from "react-icons/si";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useProjectsStore } from "@/lib/stores/useProjectsStore";
import { useEffect } from "react";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  demoUrl?: string;
  repoUrl?: string;
}

export function ProjectCard({
  id,
  title,
  description,
  image,
  technologies,
  demoUrl,
  repoUrl,
}: ProjectCardProps) {
  const router = useRouter();
  const removeProject = useProjectsStore((state) => state.removeProject);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Esta acción eliminará el proyecto permanentemente!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      // 1. Elimina la imagen del almacenamiento si existe
      if (image) {
        const match = image.match(/project-images\/([^?]+)/);
        const filePath = match ? match[1] : null;
        if (filePath) {
          await supabase.storage.from("project-images").remove([filePath]);
        }
      }

      // 2. Elimina el proyecto de la base de datos
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) {
        Swal.fire("Error", "No se pudo eliminar el proyecto", "error");
      } else {
        Swal.fire({
          title: "Eliminado",
          text: "El proyecto fue eliminado",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
        removeProject(id); // Elimina del estado global
        router.refresh(); // Actualiza inmediatamente
      }
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full relative">
      <div className="relative h-48 w-full">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader>
        <h3 className="text-xl font-bold">{title}</h3>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {technologies.map((tech: string) => (
            <Badge key={tech} variant="secondary">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center gap-2">
        {demoUrl && (
          <Link href={demoUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              Demo
            </Button>
          </Link>
        )}
        {repoUrl && (
          <Link href={repoUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <SiGithub className="h-4 w-4" />
              Código
            </Button>
          </Link>
        )}
        <Link href={`/editar-proyecto/${id}`}>
          <Button variant="secondary" size="sm">
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        </Link>
        <Button className="h-9" variant="destructive" onClick={handleDelete}>
          Eliminar
        </Button>
      </CardFooter>
    </Card>
  );
}
