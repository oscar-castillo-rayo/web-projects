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
import { deleteProjectAction } from "@/app/actions/delete-project";

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
      try {
        await deleteProjectAction(id, image);
        Swal.fire({
          title: "Eliminado",
          text: "El proyecto fue eliminado",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (e) {
        Swal.fire("Error", "No se pudo eliminar el proyecto", "error");
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
