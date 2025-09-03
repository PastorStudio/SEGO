// src/app/(app)/clients/[id]/edit/page.tsx

interface PageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function Page({ params }: PageProps) {
  const { id } = params;

  // TODO: renderiza aquí tu formulario/ UI de edición
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Editar cliente</h1>
      <p className="text-sm text-muted-foreground">ID: {id}</p>
    </div>
  );
}
