export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string | null
          demo_url: string | null
          repo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url?: string | null
          demo_url?: string | null
          repo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string | null
          demo_url?: string | null
          repo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      technologies: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      project_technologies: {
        Row: {
          id: string
          project_id: string
          technology_id: string
        }
        Insert: {
          id?: string
          project_id: string
          technology_id: string
        }
        Update: {
          id?: string
          project_id?: string
          technology_id?: string
        }
      }
    }
  }
}

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type Technology = Database["public"]["Tables"]["technologies"]["Row"]
export type ProjectWithTechnologies = Project & { technologies: Technology[] }
