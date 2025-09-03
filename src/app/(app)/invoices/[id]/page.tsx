// src/app/(app)/invoices/[id]/page.tsx
import type { Invoice } from '@/lib/definitions';
import { getInvoice } from '@/lib/data';
import Link from 'next/link';

export default async function Page({
  params,
}: {
  // Parche: tu build está exigiendo params como Promise
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;

  const invoice = (await getInvoice(id)) as Invoice | undefined;

  if (!invoice) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Factura no encontrada</h1>
        <p className="text-sm text-muted-foreground">ID: {id}</p>
        <Link href="/invoices" className="text-primary underline">
          Volver a facturas
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Factura {invoice.id}</h1>
        <Link href="/invoices" className="text-sm text-primary underline">
          ← Volver a facturas
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p><span className="text-muted-foreground">Cliente:</span> {invoice.clientName}</p>
          <p><span className="text-muted-foreground">Proyecto:</span> {invoice.projectId}</p>
          <p><span className="text-muted-foreground">Vendedor:</span> {invoice.salespersonId}</p>
          <p><span className="text-muted-foreground">NCF:</span> {invoice.ncf ?? '—'}</p>
        </div>
        <div className="space-y-2">
          <p><span className="text-muted-foreground">Monto:</span> {invoice.amount}</p>
          <p><span className="text-muted-foreground">Estado:</span> {invoice.status}</p>
          <p><span className="text-muted-foreground">Emisión:</span> {invoice.issueDate}</p>
          <p><span className="text-muted-foreground">Vence:</span> {invoice.dueDate}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="font-medium">Items</h2>
        <ul className="list-disc pl-5 text-sm">
          {invoice.items?.map(it => (
            <li key={it.id}>
              {it.description} — {it.quantity} × {it.price}
            </li>
          )) ?? <li>Sin ítems</li>}
        </ul>
      </div>

      {invoice.notes ? (
        <div className="space-y-2">
          <h2 className="font-medium">Notas</h2>
          <p className="text-sm">{invoice.notes}</p>
        </div>
      ) : null}
    </div>
  );
}
