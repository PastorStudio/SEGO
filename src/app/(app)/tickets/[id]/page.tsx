// src/app/(app)/tickets/[id]/page.tsx
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
        <h1 className="text-xl font-semibold">Ticket {ticket.id}</h1>
        <div className="text-sm">
          <Link href="/tickets" className="text-primary underline">
            ← Volver a tickets
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Título:</span> {ticket.title}</p>
