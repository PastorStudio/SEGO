
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Ticket, Send } from "lucide-react";
import { TicketForm } from "./ticket-form";
import type { User, Client, Ticket as TicketType } from "@/lib/definitions";
import { addTicket, getFirstSuperAdmin } from "@/lib/data";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CreateTicketModalProps = {
    users: User[];
    clients: Client[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateTicketModal({ users, clients, isOpen, onOpenChange }: CreateTicketModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Ticket</DialogTitle>
                    <DialogDescription>
                        Describe el problema o solicitud.
                    </DialogDescription>
                </DialogHeader>
                <TicketForm 
                    users={users} 
                    clients={clients} 
                    onFinished={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

export function SupportTicketModal({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
    const { currentUser } = useAuth();
    const { toast } = useToast();
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const supportPhoneNumber = "12016671859"; // The number to send the WhatsApp message to

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !description.trim()) {
            toast({ title: "Error", description: "Por favor, describe tu problema.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);

        try {
            const superAdmin = await getFirstSuperAdmin();
            const ticketData: Omit<TicketType, 'id' | 'createdAt' | 'comments'> = {
                title: `Ticket de Soporte de ${currentUser.name}`,
                description: description,
                requesterId: currentUser.id,
                requesterType: 'user',
                assigneeId: superAdmin?.id,
                priority: 'High',
                status: 'Open',
            };

            const newTicket = await addTicket(ticketData);
            
            toast({
                title: "Ticket de Soporte Creado",
                description: `Tu solicitud (${newTicket.id}) ha sido enviada. Serás redirigido a WhatsApp.`,
            });
            
            // Construct the WhatsApp message
            const message = `*¡Nuevo Ticket de Soporte!*
*ID:* ${newTicket.id}
*Solicitante:* ${currentUser.name} (${currentUser.email})
*Título:* ${newTicket.title}
*Descripción:* ${newTicket.description}
*Prioridad:* ${newTicket.priority}`;

            const whatsappUrl = `https://wa.me/${supportPhoneNumber}?text=${encodeURIComponent(message)}`;

            // Open WhatsApp in a new tab
            window.open(whatsappUrl, '_blank');

            onOpenChange(false);

        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "No se pudo crear el ticket de soporte.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Solicitar Soporte</DialogTitle>
                    <DialogDescription>
                        Describe tu problema o necesidad y se creará un ticket. El equipo de soporte será notificado.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="support-description">¿Cómo podemos ayudarte?</Label>
                        <Textarea
                            id="support-description"
                            placeholder="Ej: No puedo acceder a la sección de facturas, me aparece un error..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting || !description.trim()}>
                        <Send className="mr-2 h-4 w-4" />
                        {isSubmitting ? "Enviando..." : "Enviar Solicitud de Soporte"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
