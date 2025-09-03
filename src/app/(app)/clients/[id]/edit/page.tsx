
import { getClient } from "@/lib/data";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ClientForm } from "../../_components/client-form";

export default async function EditClientPage({ params }: { params: { id: string } }) {
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
