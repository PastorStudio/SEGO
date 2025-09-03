
"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { type Project, addProject, updateProject, type User, getUsers, getTickets, type Ticket } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/hooks/use-auth.tsx"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  client: z.string().min(2, "El cliente debe tener al menos 2 caracteres."),
  status: z.enum(['On Track', 'Off Track', 'Completed', 'On Hold']),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
  dueTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/, "Formato de hora inválido (ej., 10:00 AM)"),
  team: z.array(z.string()).optional(),
  eventType: z.enum(['Corporativo', 'No Corporativo']),
  linkedTickets: z.array(z.string()).optional(),
})

type ProjectFormValues = z.infer<typeof formSchema>

type ProjectFormProps = {
    project?: Project;
    onFinished?: () => void;
    className?: string;
}

export function ProjectForm({ project, onFinished, className }: ProjectFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    async function fetchData() {
      const [usersData, ticketsData] = await Promise.all([
        getUsers(),
        getTickets(),
      ]);
      setUsers(usersData);
      setTickets(ticketsData.filter(t => t.status === 'Open' || t.status === 'In Progress'));
    }
    fetchData();
  }, []);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: project ? { 
        ...project, 
        team: project.team || [], 
        eventType: project.eventType || 'No Corporativo',
        linkedTickets: project.linkedTickets || [],
    } : {
      name: "",
      client: "",
      status: "On Track",
      dueDate: "",
      dueTime: "",
      team: currentUser ? [currentUser.id] : [],
      eventType: "No Corporativo",
      linkedTickets: [],
    },
  })

  // Pre-select current user when creating a new project
  useEffect(() => {
    if (!project && currentUser) {
        form.setValue('team', [currentUser.id]);
    }
  }, [currentUser, form, project]);

  const onSubmit = async (values: ProjectFormValues) => {
    if (!currentUser) {
       toast({
        title: "Error",
        description: "No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.",
        variant: "destructive",
      });
      return;
    }

    try {
        if (project) {
            const updatedProjectData: Project = { ...project, ...values, team: values.team || [], linkedTickets: values.linkedTickets || [] };
            await updateProject(updatedProjectData);
            toast({
              title: "Proyecto Actualizado",
              description: `El proyecto "${values.name}" ha sido actualizado exitosamente.`,
            });
        } else {
            const newProjectData: Omit<Project, 'id'> = {
                name: values.name,
                client: values.client,
                status: values.status,
                dueDate: values.dueDate,
                dueTime: values.dueTime,
                team: values.team || [],
                eventType: values.eventType,
                linkedTickets: values.linkedTickets || [],
            };
            await addProject(newProjectData, currentUser.name);
            toast({
              title: "Proyecto Creado",
              description: `El proyecto "${values.name}" ha sido creado exitosamente.`,
            });
        }
        
        if (onFinished) {
            onFinished();
        } else {
            router.push("/projects");
        }
        router.refresh();
    } catch (error) {
        toast({
            title: "Error",
            description: "Ocurrió un error al guardar el proyecto. Por favor, inténtalo de nuevo.",
            variant: "destructive"
        });
    }
  }

  const content = (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8", className)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Nombre del Proyecto</FormLabel>
                  <FormControl>
                      <Input placeholder="Plataforma E-commerce" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                      <Input placeholder="Innovate Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />
              <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Tipo de Evento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="No Corporativo">No Corporativo</SelectItem>
                            <SelectItem value="Corporativo">Corporativo</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                  </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="On Track">En Progreso</SelectItem>
                            <SelectItem value="Completed">Completado</SelectItem>
                            <SelectItem value="Off Track">Con Retraso</SelectItem>
                            <SelectItem value="On Hold">En Pausa</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                  </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Fecha de Entrega</FormLabel>
                  <FormControl>
                      <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />
              <FormField
              control={form.control}
              name="dueTime"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Hora de Entrega</FormLabel>
                  <FormControl>
                      <Input placeholder="10:00 AM" {...field} />
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="team"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Equipo del Proyecto</FormLabel>
                            <FormDescription>Selecciona los miembros del equipo involucrados.</FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                        {users.map((user) => (
                            <FormField
                                key={user.id}
                                control={form.control}
                                name="team"
                                render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={user.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(user.id)}
                                                    onCheckedChange={(checked) => {
                                                        const currentValue = field.value || [];
                                                        if (checked) {
                                                            field.onChange([...currentValue, user.id]);
                                                        } else {
                                                            field.onChange(
                                                                currentValue.filter(
                                                                    (value) => value !== user.id
                                                                )
                                                            );
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {user.name} <span className="text-muted-foreground">({user.role})</span>
                                            </FormLabel>
                                        </FormItem>
                                    )
                                }}
                            />
                        ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="linkedTickets"
                render={() => (
                    <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Tickets Vinculados</FormLabel>
                            <FormDescription>Selecciona tickets abiertos o en progreso para vincular a este proyecto.</FormDescription>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                        {tickets.length > 0 ? tickets.map((ticket) => (
                            <FormField
                                key={ticket.id}
                                control={form.control}
                                name="linkedTickets"
                                render={({ field }) => {
                                    return (
                                        <FormItem
                                            key={ticket.id}
                                            className="flex flex-row items-start space-x-3 space-y-0 p-3 bg-secondary/50 rounded-md"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(ticket.id)}
                                                    onCheckedChange={(checked) => {
                                                        const currentValue = field.value || [];
                                                        if (checked) {
                                                            field.onChange([...currentValue, ticket.id]);
                                                        } else {
                                                            field.onChange(
                                                                currentValue.filter(
                                                                    (value) => value !== ticket.id
                                                                )
                                                            );
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <div className="flex-grow">
                                                <FormLabel className="font-normal">
                                                    {ticket.title}
                                                </FormLabel>
                                                <p className="text-xs text-muted-foreground">{ticket.id}</p>
                                            </div>
                                            <Badge variant="outline">{ticket.status}</Badge>
                                        </FormItem>
                                    )
                                }}
                            />
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No hay tickets abiertos para vincular.</p>
                        )}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <div className="flex justify-end gap-2 pt-4">
                {onFinished && <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>}
                <Button type="submit">{project ? 'Actualizar Proyecto' : 'Crear Proyecto'}</Button>
            </div>
        </form>
    </Form>
  )

  // If it's an edit form, render it in a card
  if (project) {
    return (
         <Card>
            <CardHeader>
                <CardTitle>Editar Detalles del Proyecto</CardTitle>
                <CardDescription>
                    Actualiza los detalles del proyecto existente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    );
  }

  // If it's a create form (for a modal), wrap it in a ScrollArea
  return (
    <ScrollArea className="h-[70vh] p-1 pr-4">
        {content}
    </ScrollArea>
  );
}
