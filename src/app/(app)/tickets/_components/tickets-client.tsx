
'use client'

import { useState } from 'react';
import { type Ticket, type User, type Client } from '@/lib/definitions';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClientDate, ClientOnly } from '@/components/client-only';
import { TicketActions } from './ticket-actions';
import { cn } from '@/lib/utils';
import { differenceInBusinessDays, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

const priorityVariant: { [key in Ticket['priority']]: "default" | "secondary" | "destructive" | "outline" } = {
  "Urgent": "destructive",
  "High": "destructive",
  "Medium": "default",
  "Low": "secondary",
}

const statusVariant: { [key in Ticket['status']]: "default" | "secondary" | "destructive" | "outline" } = {
  "Open": "default",
  "In Progress": "default",
  "On Hold": "outline",
  "Closed": "secondary",
  "Abierto": "default",
  "En Progreso": "default",
};

const statusRowColorVariant: { [key in Ticket['status']]?: string } = {
  "In Progress": "bg-yellow-500/10 hover:bg-yellow-500/20",
  "Open": "bg-blue-500/10 hover:bg-blue-500/20",
};

const getRequesterName = (ticket: Ticket, users: User[], clients: Client[]) => {
    if (ticket.requesterType === 'user') {
        return users.find(u => u.id === ticket.requesterId)?.name || 'Usuario desconocido';
    }
    return clients.find(c => c.id === ticket.requesterId)?.name || 'Cliente desconocido';
}

const getAssigneeName = (ticket: Ticket, users: User[]) => {
    if (!ticket.assigneeId) return 'Sin asignar';
    return users.find(u => u.id === ticket.assigneeId)?.name || 'Usuario desconocido';
}

type TicketsClientProps = {
    initialTickets: Ticket[];
    users: User[];
    clients: Client[];
}

export function TicketsClient({ initialTickets, users, clients }: TicketsClientProps) {
    const [tickets, setTickets] = useState(initialTickets);

    return (
        <Card>
            <CardContent className="pt-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Ticket</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Prioridad</TableHead>
                            <TableHead className="hidden md:table-cell">Solicitante</TableHead>
                            <TableHead className="hidden md:table-cell">Asignado a</TableHead>
                            <TableHead className="hidden lg:table-cell">Fecha Creación</TableHead>
                            <TableHead><span className="sr-only">Acciones</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.map(ticket => (
                             <TableRow key={ticket.id} className={cn(statusRowColorVariant[ticket.status])}>
                                <TableCell>
                                    <Link href={`/tickets/${ticket.id}`} className="font-medium hover:underline text-primary">{ticket.title}</Link>
                                    <div className="text-sm text-muted-foreground">{ticket.id}</div>
                                </TableCell>
                                <TableCell><Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge></TableCell>
                                <TableCell><Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge></TableCell>
                                <TableCell className="hidden md:table-cell">{getRequesterName(ticket, users, clients)}</TableCell>
                                <TableCell className="hidden md:table-cell">{getAssigneeName(ticket, users)}</TableCell>
                                <TableCell className="hidden lg:table-cell">
                                    <ClientOnly>
                                        <ClientDate value={ticket.createdAt} />
                                    </ClientOnly>
                                </TableCell>
                                <TableCell>
                                    <TicketActions ticket={ticket} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 {tickets.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>No hay tickets para mostrar.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
