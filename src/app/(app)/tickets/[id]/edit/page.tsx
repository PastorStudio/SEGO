// src/app/(app)/tickets/[id]/edit/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTicket } from '@/lib/data';
import type { Ticket } from '@/lib/definitions';

export default async function Page({
  params,
}: {
  // Parche: tu build actual espera params como Promise
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;

  const ticket = (await getTicket(id)) as Ticket | undefined;

  if (!ticket) {
    notFound();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar ticket</h1>
        <div className="text-sm">
          <Link href={`/tickets/${id}`} className="text-primary underline">
            ← Volver al detalle
          </Link>
        </div>
      </div>

      {/* TODO: reemplaza por tu formulario real de edición */}
      <div className="grid gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">ID:</span>{' '}
          <span className="font-mono">{ticket.id}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Título:</span>{' '}
          <span>{ticket.title}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Estado:</span>{' '}
          <span>{ticket.status}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Prioridad:</span>{' '}
          <span>{ticket.priority}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Solicitante:</span>{' '}
          <span>{ticket.requesterId}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Asignado a:</span>{' '}
          <span>{ticket.assigneeId ?? '—'}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Creado:</span>{' '}
          <span>{ticket.createdAt}</span>
        </div>
      </div>
    </div>
  );
}
