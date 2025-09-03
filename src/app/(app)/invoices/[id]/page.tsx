

import { getInvoice, getClients, getProjects } from "@/lib/data";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { InvoiceForm } from "../_components/invoice-form";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const invoice = await getInvoice(params.id);
  const clients = await getClients();
  const projects = await getProjects();

  if (!invoice) {
    notFound();
  }

  return (
    <>
      <PageHeader title={`Factura ${invoice.id}`} />
      <InvoiceForm invoice={invoice} clients={clients} projects={projects} />
    </>
  );
}


