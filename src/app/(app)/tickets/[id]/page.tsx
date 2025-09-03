// src/app/(app)/tickets/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getTicket } from '@/lib/data';

export default async function Page({
  params,
}: {
  // Tu build actual exige params como Promise
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ticket = await getTicket(id);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Ticket {ticket!.id}</h1>
    </div>
  );
}
