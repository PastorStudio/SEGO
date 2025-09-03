
import { getTicket, getUsers, getClients } from "@/lib/data"
import { notFound } from "next/navigation"
import { TicketDetailsClient } from "./_components/ticket-details-client";

export default async function TicketDetailsPage({ params }: { params: { id: string } }) {
  const ticketData = await getTicket(params.id)
  if (!ticketData) notFound()

  const allUsersData = await getUsers();
  const allClientsData = await getClients();
  

  return (
    <TicketDetailsClient
        initialTicket={ticketData}
        users={allUsersData}
        clients={allClientsData}
    />
  )
}
