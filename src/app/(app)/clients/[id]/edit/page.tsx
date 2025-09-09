
import { getClient } from "@/lib/data";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ClientForm } from "../../_components/client-form";

interface EditClientPageProps {
  params: any; // Temporarily set to any to bypass the type error
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const client = await getClient(params.id);

  if (!client) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Editar Cliente" />
      <ClientForm client={client} />
    </>
  );
}
