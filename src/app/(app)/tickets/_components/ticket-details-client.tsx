
'use client'

import { useState, useEffect, useMemo } from 'react';
import { type Ticket, type User, type Client } from "@/lib/definitions"
import { addCommentToTicket } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, User as UserIcon, Building, Clock, Calendar, AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ClientDate } from "@/components/client-only";
import { getAvatarUrl } from '@/lib/avatars';
import { useAuth } from '@/hooks/use-auth';
import { CommentSection } from '../../warehouse/_components/comment-section';
import { Separator } from '@/components/ui/separator';

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

const getInitials = (name: string) => {
    if (!name) return ''
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}

type TicketDetailsClientProps = {
    initialTicket: Ticket;
    users: User[];
    clients: Client[];
}

export function TicketDetailsClient({ initialTicket, users, clients }: TicketDetailsClientProps) {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const { currentUser } = useAuth();

  const requester = useMemo(() => {
    if (ticket.requesterType === 'user') {
      return users.find(u => u.id === ticket.requesterId);
    }
    return clients.find(c => c.id === ticket.requesterId);
  }, [ticket, users, clients]);

  const assignee = useMemo(() => {
    return users.find(u => u.id === ticket.assigneeId);
  }, [ticket, users]);
  
  return (
    <>
      <PageHeader title={ticket.title} >
         <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/tickets">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Tickets
                </Link>
            </Button>
            {/* <Button>
                <Edit className="mr-2 h-4 w-4" />
                Editar Ticket
            </Button> */}
        </div>
      </PageHeader>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Descripción del Ticket</CardTitle>
                    <CardDescription>ID: {ticket.id}</CardDescription>
                </CardHeader>
                <CardContent className="prose dark:prose-invert">
                    <p>{ticket.description}</p>
                </CardContent>
            </Card>

             <Card>
                 <CardHeader>
                    <CardTitle>Comentarios</CardTitle>
                </CardHeader>
                <CardContent>
                    <CommentSection 
                        entityId={ticket.id}
                        comments={ticket.comments || []}
                        currentUser={currentUser}
                        users={users}
                        addCommentAction={addCommentToTicket as any} // Cast because of TS mismatch with other comment actions
                    />
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Detalles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Estado</span>
                        <Badge variant={statusVariant[ticket.status]}>{ticket.status}</Badge>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Prioridad</span>
                        <Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Creado</span>
                        <span><ClientDate value={ticket.createdAt} /></span>
                    </div>
                    {ticket.closedAt && (
                         <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Cerrado</span>
                            <span><ClientDate value={ticket.closedAt} /></span>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Personas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Solicitante</h4>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                {requester && 'avatar' in requester && typeof requester.avatar === 'string' && <AvatarImage src={getAvatarUrl(requester.avatar as string)} alt={requester.name} />}
                                <AvatarFallback>
                                    {requester ? getInitials(requester.name) : '?'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{requester?.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    {ticket.requesterType === 'user' ? <UserIcon className="h-3 w-3"/> : <Building className="h-3 w-3"/> }
                                    {ticket.requesterType === 'user' ? 'Usuario Interno' : 'Cliente'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Separator />
                     <div>
                        <h4 className="text-sm font-semibold mb-2">Asignado a</h4>
                         {assignee ? (
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={getAvatarUrl(assignee.avatar)} alt={assignee.name} />
                                    <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{assignee.name}</p>
                                    <p className="text-xs text-muted-foreground">{assignee.role}</p>
                                </div>
                            </div>
                         ) : (
                            <p className="text-sm text-muted-foreground">Sin asignar</p>
                         )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </>
  )
}
