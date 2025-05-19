import { create } from "zustand";
import { ProjectWithTechnologies } from "@/lib/database.types";

interface ProjectsState {
  projects: ProjectWithTechnologies[];
  setProjects: (projects: ProjectWithTechnologies[]) => void;
  removeProject: (id: string) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  setProjects: (projects) => set({ projects }),
  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),
}));
