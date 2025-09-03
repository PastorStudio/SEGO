// src/app/(app)/clients/[id]/edit/page.tsx

// Esta página es Server Component (no pongas "use client" aquí)
export default async function Page({
  params,
}: {
  // Ajustamos al tipo que Next está exigiendo ahora mismo (Promise<any>)
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Desempaquetamos la promesa que Next (por algún motivo) está esperando
  const { id } = await params;

  // TODO: tu UI real de edición
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Editar cliente</h1>
      <p className="text-sm text-muted-foreground">ID: {id}</p>
      {/* <EditClientForm clientId={id} /> */}
    </div>
  );
}
