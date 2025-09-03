
import { getClients } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { ClientList } from "./_components/client-list"
import { CreateClientModal } from "./_components/create-client-modal"

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <PageHeader title="Clientes">
        <CreateClientModal />
      </PageHeader>
      <ClientList clients={clients} />
    </>
  )
}
