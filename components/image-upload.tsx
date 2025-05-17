"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import Image from "next/image";

type ImageUploadProps = {
  value?: string | null;
  onFileSelected?: (file: File | null) => void;
  onImageUploaded?: (url: string) => void;
};

export function ImageUpload({
  value,
  onFileSelected,
  onImageUploaded,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onFileSelected?.(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen válido");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    onFileSelected?.(file);
    onImageUploaded?.(reader.result as string); // <-- Esto falla si no usas props.onImageUploaded
    e.target.value = "";
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleButtonClick}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview ? (
          <div className="relative w-full h-48">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Vista previa"
              fill
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              Haz clic para seleccionar una imagen
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG o WEBP (máx. 1MB)
            </p>
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleButtonClick}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {preview ? "Cambiar imagen" : "Subir imagen"}
      </Button>
    </div>
  );
}
