
import { getTicket, getUsers, getClients } from "@/lib/data";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { TicketForm } from "../../_components/ticket-form";

export default async function EditTicketPage({ params }: { params: { id: string } }) {
  const ticket = await getTicket(params.id);
  const users = await getUsers();
  const clients = await getClients();

  if (!ticket) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Editar Ticket" />
      <TicketForm ticket={ticket} users={users} clients={clients} />
    </>
  );
}
