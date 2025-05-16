"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <div className="bg-destructive/10 p-3 rounded-full mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Algo salió mal</h2>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {error.message.includes("bucket")
          ? 'Es necesario crear el bucket "project-images" en tu panel de Supabase Storage antes de continuar.'
          : "Ha ocurrido un error al procesar tu solicitud."}
      </p>

      {error.message.includes("bucket") && (
        <div className="bg-muted p-4 rounded-md mb-6 max-w-md">
          <h3 className="font-medium mb-2">Cómo crear el bucket:</h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>Ve al panel de administración de Supabase</li>
            <li>Navega a la sección "Storage"</li>
            <li>Haz clic en "New Bucket"</li>
            <li>Nombra el bucket como "project-images"</li>
            <li>Marca la opción "Public bucket" para permitir acceso público</li>
            <li>Haz clic en "Create bucket"</li>
            <li>En la pestaña "Policies", añade una política que permita subir archivos</li>
          </ol>
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="outline">
          Intentar de nuevo
        </Button>
        <Link href="/">
          <Button className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}
