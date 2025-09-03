// src/app/(app)/projects/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/data';
import type { Project } from '@/lib/definitions';
import Link from 'next/link';

export default async function Page({
  params,
}: {
  // Parche: tu build actualmente espera params como Promise
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;

  const project = (await getProject(id)) as Project | undefined;

  if (!project) {
    notFound(); // <- ¡importante invocarlo!
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar proyecto</h1>
        <Link href={`/projects/${id}`} className="text-sm text-primary underline">
          ← Volver al detalle
        </Link>
      </div>

      {/* Coloca aquí tu formulario real de edición */}
      <div className="grid gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">ID:</span>{' '}
          <span className="font-mono">{project.id}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Nombre:</span>{' '}
          <span>{project.name}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Cliente:</span>{' '}
          <span>{project.client}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Estado:</span>{' '}
          <span>{project.status}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Entrega:</span>{' '}
          <span>
            {project.dueDate} {project.dueTime}
          </span>
        </div>
      </div>
    </div>
  );
}
