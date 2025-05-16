"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function AddProjectButton() {
  return (
    <Link href="/agregar-proyecto">
      <Button className="flex items-center gap-2">
        <PlusCircle className="h-4 w-4" />
        Agregar Nuevo Proyecto
      </Button>
    </Link>
  );
}