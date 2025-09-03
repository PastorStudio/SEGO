
'use client'

import { useState, useEffect } from 'react';
import { getTickets, getUsers, getClients } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { TicketsClient } from "./_components/tickets-client";
import { CreateTicketModal } from "./_components/create-ticket-modal";
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { type Ticket, type User, type Client } from '@/lib/definitions';

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [ticketsData, usersData, clientsData] = await Promise.all([
                getTickets(),
                getUsers(),
                getClients(),
            ]);
            setTickets(ticketsData);
            setUsers(usersData);
            setClients(clientsData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
             <>
                <PageHeader title="Centro de Tickets">
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" /> Nueva Entrada
                    </Button>
                </PageHeader>
                <div>Cargando tickets...</div>
            </>
        )
    }

    return (
        <>
            <PageHeader title="Centro de Tickets">
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nueva Entrada
                </Button>
            </PageHeader>
            <TicketsClient 
                initialTickets={tickets}
                users={users}
                clients={clients}
            />
            {isModalOpen && (
                <CreateTicketModal 
                    users={users} 
                    clients={clients} 
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                />
            )}
        </>
    );
}
