import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Database, FolderOpen, ExternalLink } from "lucide-react"
import Image from "next/image"

export default function InstruccionesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Volver a proyectos
      </Link>

      <h1 className="text-3xl font-bold mb-6">Configuración del Proyecto</h1>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Paso 1: Crear el bucket de almacenamiento
            </CardTitle>
            <CardDescription>Crea el bucket necesario para almacenar las imágenes de tus proyectos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                Ve al{" "}
                <a
                  href="https://app.supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center"
                >
                  panel de administración de Supabase
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </li>
              <li>Selecciona tu proyecto</li>
              <li>
                En el menú lateral, haz clic en <strong>Storage</strong>
              </li>
              <li>
                Haz clic en <strong>New Bucket</strong>
              </li>
              <li>
                <div className="space-y-2">
                  <p>
                    Nombra el bucket como <code className="bg-muted px-1 py-0.5 rounded">project-images</code>
                  </p>
                  <div className="relative h-48 w-full border rounded-md overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=600"
                      alt="Crear bucket en Supabase"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </li>
              <li>
                Marca la opción <strong>Public bucket</strong> para permitir acceso público
              </li>
              <li>
                Haz clic en <strong>Create bucket</strong>
              </li>
            </ol>

            <div className="mt-4">
              <a
                href="https://app.supabase.com/project/_/storage/buckets"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Button variant="default" className="flex items-center">
                  Ir a Supabase Storage
                  <ExternalLink className="ml-1 h-4 w-4" />
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Paso 2: Configurar políticas de seguridad
            </CardTitle>
            <CardDescription>Configura las políticas de seguridad para permitir subir archivos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal pl-5 space-y-4">
              <li>
                En la sección Storage, selecciona el bucket{" "}
                <code className="bg-muted px-1 py-0.5 rounded">project-images</code>
              </li>
              <li>
                Haz clic en la pestaña <strong>Policies</strong>
              </li>
              <li>
                <div className="space-y-2">
                  <p>
                    Haz clic en <strong>New Policy</strong>
                  </p>
                  <div className="relative h-48 w-full border rounded-md overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=600"
                      alt="Crear política en Supabase"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </li>
              <li>
                Selecciona <strong>For full customization</strong>
              </li>
              <li>
                Configura la política con estos valores:
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li>
                    Policy name: <code className="bg-muted px-1 py-0.5 rounded">Allow public access</code>
                  </li>
                  <li>
                    Allowed operations: <code className="bg-muted px-1 py-0.5 rounded">SELECT, INSERT</code>
                  </li>
                  <li>
                    Policy definition: <code className="bg-muted px-1 py-0.5 rounded">true</code>
                  </li>
                </ul>
              </li>
              <li>
                Haz clic en <strong>Save policy</strong>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">
          Una vez completados estos pasos, podrás subir imágenes para tus proyectos.
        </p>
        <Link href="/agregar-proyecto">
          <Button>Volver a agregar proyecto</Button>
        </Link>
      </div>
    </div>
  )
}
