
import { getInvoices, getClients, getProjects } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { InvoiceList } from "./_components/invoice-list"
import { CreateInvoiceModal } from "./_components/create-invoice-modal";

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  const clients = await getClients();
  const projects = await getProjects();

  return (
    <>
      <PageHeader title="Facturas">
        <CreateInvoiceModal clients={clients} projects={projects} />
      </PageHeader>
      <InvoiceList initialInvoices={invoices} initialClients={clients} />
    </>
  )
}
