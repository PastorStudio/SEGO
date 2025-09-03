
'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { type User, type Client, type Ticket, addTicket, updateTicket } from "@/lib/data"
import { useAuth } from "@/hooks/use-auth.tsx"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres."),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  requesterId: z.string().min(1, "Debes seleccionar un solicitante."),
  requesterType: z.enum(['user', 'client']),
  assigneeId: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: z.enum(['Open', 'In Progress', 'Closed', 'On Hold']),
})

type TicketFormValues = z.infer<typeof formSchema>

type TicketFormProps = {
    ticket?: Ticket;
    users: User[];
    clients: Client[];
    onFinished?: () => void;
}

export function TicketForm({ ticket, users, clients, onFinished }: TicketFormProps) {
    const { toast } = useToast()
    const router = useRouter()
    const { currentUser } = useAuth();
    
    const form = useForm<TicketFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: ticket ? {
            ...ticket,
            assigneeId: ticket.assigneeId || undefined,
        } : {
            title: "",
            description: "",
            requesterId: currentUser?.id,
            requesterType: "user",
            priority: 'Medium',
            status: 'Open',
        },
    });

    const onSubmit = async (values: TicketFormValues) => {
        try {
            if (ticket) {
                await updateTicket({ ...ticket, ...values });
                toast({
                    title: "Ticket Actualizado",
                    description: "El ticket ha sido actualizado exitosamente.",
                });
            } else {
                await addTicket(values);
                toast({
                    title: "Ticket Creado",
                    description: "El ticket ha sido creado exitosamente.",
                })
            }

            if (onFinished) {
                onFinished();
            } else {
                 router.push("/tickets");
            }
            router.refresh();
        } catch (e) {
            toast({
                title: "Error",
                description: "No se pudo guardar el ticket.",
                variant: "destructive"
            });
        }
    }

    const requesterType = form.watch('requesterType');

    const formContent = (
         <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                            <Input placeholder="Ej: El proyector de la sala de juntas no funciona" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Descripción Detallada</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Describe el problema o solicitud con la mayor cantidad de detalles posible..." {...field} rows={5}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="requesterType"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Tipo de Solicitante</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="user">Usuario Interno</SelectItem>
                                    <SelectItem value="client">Cliente Externo</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="requesterId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Solicitante</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {requesterType === 'user' ? (
                                        users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)
                                    ) : (
                                        clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="assigneeId"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Asignar a</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar un responsable" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Prioridad</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Low">Baja</SelectItem>
                                    <SelectItem value="Medium">Media</SelectItem>
                                    <SelectItem value="High">Alta</SelectItem>
                                    <SelectItem value="Urgent">Urgente</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Open">Abierto</SelectItem>
                                <SelectItem value="In Progress">En Progreso</SelectItem>
                                <SelectItem value="On Hold">En Pausa</SelectItem>
                                <SelectItem value="Closed">Cerrado</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={onFinished ? onFinished : () => router.back()}>Cancelar</Button>
                    <Button type="submit">{ticket ? "Actualizar Ticket" : "Crear Ticket"}</Button>
                </div>
            </form>
        </Form>
    );

    if(ticket) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Editar Ticket</CardTitle>
                    <CardDescription>Actualiza los detalles del ticket existente.</CardDescription>
                </CardHeader>
                <CardContent>{formContent}</CardContent>
            </Card>
        )
    }

    return (
       <ScrollArea className="h-[70vh] p-1 pr-4">
         {formContent}
       </ScrollArea>
    )
}
