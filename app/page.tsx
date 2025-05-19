import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/project-card";
import { getProjects } from "@/lib/actions/projects";
import { AddProjectButton } from "@/components/AddProjectButton";

export default async function Home() {
  // SSR: fetch siempre datos frescos
  const projects = await getProjects({ cache: "no-store" });

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-4">Mi Portafolio de Proyectos</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Una colección de mis trabajos de diseño y desarrollo web
        </p>
        <AddProjectButton />
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Mis Proyectos</h2>
        {projects.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">
              No hay proyectos todavía. ¡Agrega tu primer proyecto!
            </p>
            <Link href="/agregar-proyecto" className="mt-4 inline-block">
              <Button variant="outline" className="mt-2">
                Agregar Proyecto
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                image={project.image_url || "/placeholder.svg"}
                technologies={project.technologies.map((tech) => tech.name)}
                demoUrl={project.demo_url || undefined}
                repoUrl={project.repo_url || undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
