// src/app/(app)/clients/[id]/edit/page.tsx

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  // Coloca aquí tu UI real de edición:
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-semibold">Editar cliente</h1>
      <p className="text-sm text-muted-foreground">ID: {id}</p>
      {/* <EditClientForm clientId={id} /> */}
    </div>
  );
}
