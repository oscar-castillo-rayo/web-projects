"use client";

import type React from "react";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/image-upload";
import { createProject, checkStorageBucket } from "@/lib/actions/projects";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase/client";
import { uploadProjectImage } from "@/lib/actions/projects";

export default function AgregarProyecto() {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [lastUploadedImageUrl, setLastUploadedImageUrl] = useState<
    string | null
  >(null);
  const [demoUrl, setDemoUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [technology, setTechnology] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Estado para el bucket de almacenamiento
  const [bucketStatus, setBucketStatus] = useState<{
    checking: boolean;
    exists: boolean;
    error?: string;
  }>({
    checking: true,
    exists: false,
  });

  // Verificar si el bucket existe al cargar la página
  useEffect(() => {
    const checkBucket = async () => {
      try {
        setBucketStatus({ checking: true, exists: false });
        const result = await checkStorageBucket();

        if (result.error) {
          setBucketStatus({
            checking: false,
            exists: false,
            error: result.error,
          });
        } else {
          setBucketStatus({
            checking: false,
            exists: result.exists,
          });
        }
      } catch (error) {
        setBucketStatus({
          checking: false,
          exists: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    };

    checkBucket();
  }, []);

  const handleAddTechnology = () => {
    if (technology.trim() !== "" && !technologies.includes(technology.trim())) {
      setTechnologies([...technologies, technology.trim()]);
      setTechnology("");
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !imageUrl) {
      alert(
        "Por favor, completa los campos obligatorios: título, descripción e imagen"
      );
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("imageUrl", imageUrl);
    formData.append("demoUrl", demoUrl);
    formData.append("repoUrl", repoUrl);
    formData.append("technologies", JSON.stringify(technologies));

    startTransition(() => {
      createProject(formData);
    });

    setLastUploadedImageUrl(null);
  };

  const handleImageUploaded = (url: string) => {
    console.log("url", url);
    setImageUrl(url);
  };

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;

    // Si ya hay una imagen subida y aún no se ha guardado el proyecto, elimínala
    if (lastUploadedImageUrl) {
      const match = lastUploadedImageUrl.match(/project-images\/([^?]+)/);
      const filePath = match ? match[1] : null;
      if (filePath) {
        await supabase.storage.from("project-images").remove([filePath]);
      }
      setLastUploadedImageUrl(null);
      setImageUrl("");
    }

    // Sube la nueva imagen
    const url = await uploadProjectImage(file);
    setImageUrl(url);
    setLastUploadedImageUrl(url);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a proyectos
      </Link>

      {bucketStatus.checking ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>Verificando configuración de almacenamiento...</p>
        </div>
      ) : !bucketStatus.exists ? (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuración de almacenamiento requerida</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              Es necesario crear el bucket "project-images" en Supabase Storage
              antes de poder subir imágenes.
            </p>
            <div className="mt-4 space-y-2">
              <Link href="/instrucciones">
                <Button variant="outline" size="sm" className="mr-2">
                  Ver instrucciones detalladas
                </Button>
              </Link>
              <a
                href="https://app.supabase.com/project/_/storage/buckets"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center"
                >
                  Ir al panel de Supabase Storage
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </a>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-2 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">
            Almacenamiento configurado correctamente
          </AlertTitle>
          <AlertDescription>
            El bucket de almacenamiento está listo para subir imágenes.
          </AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Agregar Nuevo Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título del Proyecto *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Tienda Online"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe brevemente tu proyecto..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Imagen del Proyecto *</Label>
              {bucketStatus.exists ? (
                <>
                  {!imageUrl ? (
                    <ImageUpload
                      onFileSelected={handleFileSelected}
                      onImageUploaded={handleImageUploaded}
                    />
                  ) : (
                    <div className="flex flex-col gap-2">
                      <img
                        src={imageUrl}
                        alt="Imagen del proyecto"
                        className="max-h-40 rounded border"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setImageUrl("")}
                        >
                          Cambiar imagen
                        </Button>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Imagen subida correctamente
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="border border-dashed rounded-lg p-6 text-center bg-muted/20">
                  <p className="text-muted-foreground">
                    Configura el almacenamiento primero para poder subir
                    imágenes
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demoUrl">URL de Demo (opcional)</Label>
                <Input
                  id="demoUrl"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://mi-proyecto.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repoUrl">URL del Repositorio (opcional)</Label>
                <Input
                  id="repoUrl"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/usuario/repo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technology">Tecnologías Utilizadas</Label>
              <div className="flex gap-2">
                <Input
                  id="technology"
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  placeholder="Ej: React"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTechnology();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddTechnology}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {technologies.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTechnology(tech)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {technologies.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Agrega las tecnologías que utilizaste en este proyecto
                  </p>
                )}
              </div>
            </div>

            <p>
              title: {title ? "ok" : "faltante"} | description:{" "}
              {description ? "ok" : "faltante"} | imageUrl:{" "}
              {imageUrl ? "ok" : "faltante"} | bucket exists:{" "}
              {bucketStatus.exists ? "sí" : "no"} | checking:{" "}
              {bucketStatus.checking ? "sí" : "no"}
            </p>
          </form>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={
              isPending ||
              !title ||
              !description ||
              !imageUrl ||
              !bucketStatus.exists ||
              bucketStatus.checking
            }
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Proyecto"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center">
        <Link href="/agregar-proyecto">
          <Button className="flex items-center gap-2">
            {/* <PlusCircle className="h-4 w-4" /> */}
            Agregar Nuevo Proyecto
          </Button>
        </Link>
      </div>
    </div>
  );
}
