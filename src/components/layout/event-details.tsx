

'use client'

import { useState, useEffect } from 'react';
import {
  getProject,
  getTask,
  getInvoice,
  getWarehouseRequest,
  getUsers,
} from '@/lib/data';
import { type Project, type Task, type Invoice, type WarehouseRequest } from '@/lib/definitions';
import { type CalendarEvent } from './calendar-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ClientDate, ClientNumber } from '../client-only';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

type EventDetailsProps = {
  event: CalendarEvent;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  setCalendarOpen: (open: boolean) => void;
};

// Mapeos de traducción
const projectStatusTranslate: { [key in Project['status']]: string } = { "On Track": "En Progreso", "Completed": "Concluido", "Off Track": "Con Retraso", "On Hold": "En Pausa" };
const taskStatusTranslate: { [key in Task['status']]: string } = { "Done": "Hecho", "In Progress": "En Progreso", "To Do": "Por Hacer" };
const invoiceStatusTranslate: { [key in Invoice['status']]: string } = { "Paid": "Pagada", "Pending": "Pendiente", "Overdue": "Vencida", "Draft": "Borrador" };
const requestStatusTranslate: { [key in WarehouseRequest['status']]: string } = { "Completed": "Completado", "In Progress": "En Proceso", "Pending": "Pendiente" };

// Mapeos de variantes de Badge
const projectStatusVariant: { [key in Project['status']]: "default" | "secondary" | "destructive" | "outline" } = { "On Track": "default", "Completed": "secondary", "Off Track": "destructive", "On Hold": "outline" };
const taskStatusVariant: { [key in Task['status']]: "default" | "secondary" | "outline" } = { "Done": "secondary", "In Progress": "default", "To Do": "outline" };
const invoiceStatusVariant: { [key in Invoice['status']]: "default" | "secondary" | "destructive" | "outline" } = { "Paid": "secondary", "Pending": "default", "Overdue": "destructive", "Draft": "outline" };
const requestStatusVariant: { [key in WarehouseRequest['status']]: "default" | "secondary" | "destructive" } = { "Completed": "secondary", "In Progress": "default", "Pending": "destructive" };


export function EventDetails({ event, isOpen, onOpenChange, setCalendarOpen }: EventDetailsProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!event) return;

    const fetchDetails = async () => {
      setLoading(true);
      const { type, id } = event.resource;
      let fetchedDetails = null;

      try {
        if (type === 'project') fetchedDetails = await getProject(id);
        else if (type === 'task') {
          const task = await getTask(id);
          if (task) {
            const project = await getProject(task.projectId);
            fetchedDetails = { ...task, projectName: project?.name };
          }
        } else if (type === 'invoice') {
          fetchedDetails = await getInvoice(id);
        } else if (type === 'request') {
          const request = await getWarehouseRequest(id);
           if (request) {
            const project = await getProject(request.projectId);
            const requester = await getUsers().then(users => users.find(u => u.id === request.requesterId));
            fetchedDetails = { ...request, projectName: project?.name, requesterName: requester?.name };
          }
        }
        setDetails(fetchedDetails);
      } catch (error) {
        console.error("Failed to fetch event details:", error);
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [event]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4 pt-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Separator />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
        </div>
      );
    }

    if (!details) {
      return <p>No se pudieron cargar los detalles del evento.</p>;
    }

    const { type } = event.resource;

    switch (type) {
      case 'project':
        return (
          <div className="space-y-3">
             <div className="flex justify-between items-start">
                <span>Estado:</span>
                <Badge variant={projectStatusVariant[(details as Project).status]}>{projectStatusTranslate[(details as Project).status]}</Badge>
            </div>
            <div className="flex justify-between items-start">
                <span>Cliente:</span>
                <span className="font-medium text-right">{details.client}</span>
            </div>
            <div className="flex justify-between items-start">
                <span>Fecha de Entrega:</span>
                <span className="font-medium"><ClientDate value={details.dueDate} /></span>
            </div>
          </div>
        );
      case 'task':
        return (
          <div className="space-y-3">
             <div className="flex justify-between items-start">
                <span>Estado:</span>
                <Badge variant={taskStatusVariant[(details as Task).status]}>{taskStatusTranslate[(details as Task).status]}</Badge>
            </div>
            <div className="flex justify-between items-start">
                <span>Proyecto:</span>
                <Link href={`/projects/${details.projectId}`} className="font-medium text-right hover:underline text-primary">{details.projectName}</Link>
            </div>
             <div className="flex justify-between items-start">
                <span>Fecha Límite:</span>
                <span className="font-medium"><ClientDate value={details.dueDate} /></span>
            </div>
          </div>
        );
      case 'invoice':
        return (
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <span>Estado:</span>
                    <Badge variant={invoiceStatusVariant[(details as Invoice).status]}>{invoiceStatusTranslate[(details as Invoice).status]}</Badge>
                </div>
                 <div className="flex justify-between items-start">
                    <span>Cliente:</span>
                    <span className="font-medium text-right">{details.clientName}</span>
                </div>
                <div className="flex justify-between items-start">
                    <span>Monto:</span>
                    <span className="font-medium"><ClientNumber value={details.amount} /></span>
                </div>
                 <div className="flex justify-between items-start">
                    <span>Fecha de Vencimiento:</span>
                    <span className="font-medium"><ClientDate value={details.dueDate} /></span>
                </div>
            </div>
        );
      case 'request':
        return (
           <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <span>Estado:</span>
                    <Badge variant={requestStatusVariant[(details as WarehouseRequest).status]}>{requestStatusTranslate[(details as WarehouseRequest).status]}</Badge>
                </div>
                <div className="flex justify-between items-start">
                    <span>Proyecto:</span>
                    <Link href={`/projects/${details.projectId}`} className="font-medium text-right hover:underline text-primary">{details.projectName}</Link>
                </div>
                 <div className="flex justify-between items-start">
                    <span>Solicitante:</span>
                    <span className="font-medium text-right">{details.requesterName}</span>
                </div>
                <div className="flex justify-between items-start">
                    <span>Fecha Requerida:</span>
                    <span className="font-medium"><ClientDate value={details.requiredByDate} /></span>
                </div>
                <div className="flex justify-between items-start">
                    <span>Artículos:</span>
                    <span className="font-medium">{details.items.length}</span>
                </div>
            </div>
        );
      default:
        return <p>Tipo de evento no reconocido.</p>;
    }
  };

  const getLinkForEvent = () => {
    if (!event) return "/";
    const { type, id } = event.resource;
    switch(type) {
        case 'project': return `/projects/${id}`;
        case 'task': return `/tasks`; // No hay página de detalles de tarea
        case 'invoice': return `/invoices/${id}`;
        case 'request': return `/warehouse`; // No hay página de detalles de pedido
        default: return "/";
    }
  }

  const handleLinkClick = () => {
    onOpenChange(false);
    setCalendarOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="truncate pr-10">{event?.title || 'Detalles del Evento'}</DialogTitle>
          <DialogDescription>
            Un resumen rápido del evento seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        {renderContent()}
        <Separator />
        <Button asChild variant="outline" className="w-full">
            <Link href={getLinkForEvent()} onClick={handleLinkClick}>
                Ver Detalles Completos <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
