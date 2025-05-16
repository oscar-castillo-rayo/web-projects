import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mi Portafolio de Proyectos",
  description: "Una colección de mis trabajos de diseño y desarrollo web",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <main className="min-h-screen bg-background">
            <nav className="border-b">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Mi Portafolio</h1>
                <div className="flex gap-4">
                  <a href="/" className="hover:underline">
                    Inicio
                  </a>
                  <a href="/agregar-proyecto" className="hover:underline">
                    Agregar Proyecto
                  </a>
                  <a href="/instrucciones" className="hover:underline">
                    Instrucciones
                  </a>
                </div>
              </div>
            </nav>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
