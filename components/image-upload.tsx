"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Loader2 } from "lucide-react"
import Image from "next/image"
import { uploadProjectImage } from "@/lib/actions/projects"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
}

export function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Actualizar la función handleFileChange para mostrar un mensaje más claro
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB")
      return
    }

    // Mostrar vista previa
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Subir imagen
    try {
      setIsUploading(true)
      const imageUrl = await uploadProjectImage(file)
      onImageUploaded(imageUrl)
    } catch (error) {
      console.error("Error al subir imagen:", error)

      // Mensaje específico para error de bucket no encontrado
      if (error instanceof Error && error.message.includes("bucket")) {
        alert(
          `${error.message} Necesitas crear el bucket 'project-images' en tu panel de Supabase Storage antes de continuar.`,
        )
      } else {
        alert(`Error al subir la imagen: ${error instanceof Error ? error.message : "Inténtalo de nuevo."}`)
      }

      // Limpiar la vista previa si hay error
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

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
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative w-full h-48">
            <Image src={preview || "/placeholder.svg"} alt="Vista previa" fill className="object-contain" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Haz clic para seleccionar una imagen</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG o WEBP (máx. 5MB)</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <Button type="button" variant="outline" onClick={handleButtonClick} disabled={isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Subiendo...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {preview ? "Cambiar imagen" : "Subir imagen"}
          </>
        )}
      </Button>
    </div>
  )
}
