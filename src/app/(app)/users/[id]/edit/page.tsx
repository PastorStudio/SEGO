// src/app/(app)/users/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/lib/data';
import type { User } from '@/lib/definitions';

export default async function Page({
  params,
}: {
  // Parche: tu build actual espera params como Promise
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;

  const user = (await getUser(id)) as User | undefined;

  if (!user) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar usuario</h1>
        <div className="text-sm">
          <Link href={`/users/${id}`} className="text-primary underline">
            ← Volver al perfil
          </Link>
        </div>
      </div>

      {/* TODO: reemplaza por tu formulario real de edición */}
      <div className="grid gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">ID:</span>{' '}
          <span className="font-mono">{user.id}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Nombre:</span>{' '}
          <span>{user.name}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Email:</span>{' '}
          <span>{user.email}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Rol:</span>{' '}
          <span>{user.role}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Estado:</span>{' '}
          <span>{user.status}</span>
        </div>
      </div>
    </div>
  );
}
