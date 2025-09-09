'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  getTasks,
  getWarehouseRequests,
  getFirstSuperAdmin,
  addTask,
  addTicket,
  addWarehouseRequest,
  updateTaskStatus
} from "@/lib/data";
import { generateProjectSuggestions } from "@/lib/ai";
import { type Project, type Task, type WarehouseRequest, type User, type Ticket } from "@/lib/definitions";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, Package, ListTodo, Brain, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientDate } from "@/components/client-only";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

const POLLING_INTERVAL = 30000; // 30 seconds

const statusVariant: { [key in Project['status']]: "default" | "secondary" | "destructive" | "outline" } = {
  "On Track": "default",
  "Completed": "secondary",
  "Off Track": "destructive",
  "On Hold": "outline"
}

const statusTranslate: { [key in Project['status']]: string } = {
  "On Track": "En Progreso",
  "Completed": "Concluido",
  "Off Track": "Con Retraso",
  "On Hold": "En Pausa"
}

const taskStatusVariant: { [key in Task['status']]: "default" | "secondary" | "outline" } = {
  "Done": "secondary",
  "In Progress": "default",
  "To Do": "outline",
}

const taskStatusTranslate: { [key in Task['status']]: string } = {
  "Done": "Hecho",
  "In Progress": "En Progreso",
  "To Do": "Por Hacer",
}

const requestStatusVariant: { [key in WarehouseRequest['status']]: "default" | "secondary" | "destructive" } = {
  "Pending": "destructive",
  "In Progress": "default",
  "Completed": "secondary",
};

const requestStatusTranslate: { [key in WarehouseRequest['status']]: string } = {
  "Pending": "Pendiente",
  "In Progress": "En Proceso",
  "Completed": "Completado",
};

const translatePriority = (priority: 'Baja' | 'Media' | 'Alta' | undefined): 'Low' | 'Medium' | 'High' | 'Urgent' => {
  if (!priority) return 'Medium';
  switch (priority) {
    case 'Baja':
      return 'Low';
    case 'Media':
      return 'Medium';
    case 'Alta':
      return 'High';
    default:
      return 'Medium';
  }
};

const getInitials = (name: string) => {
    if (!name) return ''
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}

type ProjectDetailsClientProps = {
    initialProject: Project;
    initialTasks: Task[];
    initialWarehouseRequests: WarehouseRequest[];
    allUsers: User[];
}

type AISuggestions = {
  tasks?: { title: string; dueDate?: string; }[];
  tickets?: { title: string; description?: string; priority?: 'Baja' | 'Media' | 'Alta'; }[];
  warehouseRequests?: { itemName: string; quantity: number; }[];
};

export function ProjectDetailsClient({ initialProject, initialTasks, initialWarehouseRequests, allUsers }: ProjectDetailsClientProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [warehouseRequests, setWarehouseRequests] = useState<WarehouseRequest[]>(initialWarehouseRequests);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [parsedSuggestions, setParsedSuggestions] = useState<AISuggestions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState<string | null>(null);

  const teamMembers = useMemo(() => 
    allUsers.filter(user => project.team.includes(user.id)),
    [allUsers, project.team]
  );
  
  useEffect(() => {
    const pollData = async () => {
      const allTasks = await getTasks();
      const allRequests = await getWarehouseRequests();
      setTasks(allTasks.filter(task => task.projectId === project.id));
      setWarehouseRequests(allRequests.filter(req => req.projectId === project.id));
    };

    const intervalId = setInterval(pollData, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [project.id]);

  const handleGenerateClick = async () => {
    setIsAiModalOpen(true);
    setIsGenerating(true);
    setParsedSuggestions(null);
    setAiSuggestions("Generando sugerencias, por favor espera...");

    const projectContext = `
      Project Name: ${project.name}
      Client: ${project.client}
      Due Date: ${project.dueDate}
      Current Tasks: ${tasks.map(t => t.title).join(', ')}
    `;
    
    try {
      const jsonString = await generateProjectSuggestions(projectContext);
      const cleanedJsonString = jsonString.replace(/```json\n|```/g, '').trim();
      const suggestions: AISuggestions = JSON.parse(cleanedJsonString);
      
      setParsedSuggestions(suggestions);

      let formattedText = "Sugerencias de la IA:\n\n";
      if (suggestions.tasks && suggestions.tasks.length > 0) {
        formattedText += "Tareas Sugeridas:\n";
        suggestions.tasks.forEach((task: any) => {
          formattedText += `- Título: ${task.title}, Fecha Límite: ${task.dueDate || 'No especificada'}\n`;
        });
        formattedText += "\n";
      }
      if (suggestions.tickets && suggestions.tickets.length > 0) {
        formattedText += "Tickets Sugeridos:\n";
        suggestions.tickets.forEach((ticket: any) => {
          formattedText += `- Título: ${ticket.title}, Prioridad: ${ticket.priority || 'No especificada'}\n  Descripción: ${ticket.description || ''}\n`;
        });
        formattedText += "\n";
      }
      if (suggestions.warehouseRequests && suggestions.warehouseRequests.length > 0) {
        formattedText += "Solicitudes de Almacén Sugeridas:\n";
        suggestions.warehouseRequests.forEach((req: any) => {
          formattedText += `- Artículo: ${req.itemName}, Cantidad: ${req.quantity || 1}\n`;
        });
      }
      setAiSuggestions(formattedText.trim());

    } catch (error: any) {
      console.error("Error processing AI suggestions:", error);
      setAiSuggestions("Error al procesar las sugerencias de IA. La respuesta no fue un JSON válido o la API falló.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateItems = async () => {
    if (!parsedSuggestions) {
      alert("No hay sugerencias para crear.");
      return;
    }
    
    setIsCreating(true);
    
    try {
      const adminUser = await getFirstSuperAdmin();
      if (!adminUser) {
        throw new Error("No se pudo encontrar un usuario Super-Admin para asignar las tareas.");
      }

      let itemsCreated = false;

      if (parsedSuggestions.tasks) {
        for (const task of parsedSuggestions.tasks) {
          await addTask({
            projectId: project.id,
            title: task.title,
            dueDate: task.dueDate || new Date().toISOString().split('T')[0],
            status: 'To Do'
          }, adminUser.name);
          itemsCreated = true;
        }
      }

      if (parsedSuggestions.tickets) {
        for (const ticket of parsedSuggestions.tickets) {
          await addTicket({
            title: ticket.title,
            description: ticket.description || '',
            priority: translatePriority(ticket.priority),
            status: 'Open',
            requesterId: adminUser.id,
            requesterType: 'user',
            assigneeId: undefined,
          });
          itemsCreated = true;
        }
      }

      if (parsedSuggestions.warehouseRequests && parsedSuggestions.warehouseRequests.length > 0) {
        const warehouseItems = parsedSuggestions.warehouseRequests.map(item => ({
          id: crypto.randomUUID(),
          name: item.itemName,
          quantity: item.quantity
        }));

        await addWarehouseRequest({
          projectId: project.id,
          requesterId: adminUser.id,
          status: 'Pending',
          requestDate: new Date().toISOString().split('T')[0],
          requiredByDate: new Date().toISOString().split('T')[0],
          items: warehouseItems,
          notes: 'Generado por IA'
        }, adminUser.name);
        itemsCreated = true;
      }

      if (itemsCreated) {
        alert("¡Los elementos sugeridos han sido creados exitosamente!");
      } else {
        alert("No se encontraron elementos para crear en las sugerencias.");
      }

    } catch (error) {
      console.error("Error creating items from AI suggestions:", error);
      alert("Ocurrió un error al crear los elementos. Revisa la consola para más detalles.");
    } finally {
      setIsCreating(false);
      setIsAiModalOpen(false);
    }
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
    setIsUpdatingTask(taskId);
    try {
      await updateTaskStatus(taskId, status);
    } catch (error) {
      console.error("Failed to update task status", error);
      alert("Error al actualizar el estado de la tarea.");
    } finally {
      setIsUpdatingTask(null);
    }
  };

  return (
    <>
      <PageHeader title={project.name} >
         <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/projects">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Proyectos
                </Link>
            </Button>
            <Button asChild>
                <Link href={`/projects/${project.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </Link>
            </Button>
            <Button onClick={handleGenerateClick} disabled={isGenerating || isCreating}>
              {isGenerating ? "Generando..." : <><Brain className="mr-2 h-4 w-4" /> Generar con IA</>}
            </Button>
        </div>
      </PageHeader>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Detalles del Proyecto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">ID</span>
                        <span className="font-mono">{project.id}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Cliente</span>
                        <span>{project.client}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Estado</span>
                        <Badge variant={statusVariant[project.status]}>{statusTranslate[project.status]}</Badge>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Fecha de Entrega</span>
                        <span><ClientDate value={project.dueDate} /></span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Hora</span>
                        <span>{project.dueTime}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader className="flex flex-row items-center gap-4">
                    <ListTodo className="h-6 w-6" />
                    <CardTitle>Tareas del Proyecto</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tarea</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Fecha Límite</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.length > 0 ? tasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell><Badge variant={taskStatusVariant[task.status]}>{taskStatusTranslate[task.status]}</Badge></TableCell>
                                    <TableCell className="text-right"><ClientDate value={task.dueDate} /></TableCell>
                                    <TableCell className="text-right">
                                      {isUpdatingTask === task.id ? (
                                        <p className="text-xs text-muted-foreground">Actualizando...</p>
                                      ) : (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                              <span className="sr-only">Abrir menú</span>
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                              <Link href={`/tasks/${task.id}`}>Ver/Editar Detalles</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuSub>
                                              <DropdownMenuSubTrigger>Cambiar Estado</DropdownMenuSubTrigger>
                                              <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                  <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'To Do')}>Por Hacer</DropdownMenuItem>
                                                  <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'In Progress')}>En Progreso</DropdownMenuItem>
                                                  <DropdownMenuItem onSelect={() => handleStatusChange(task.id, 'Done')}>Hecho</DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                              </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No hay tareas para este proyecto.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                 <CardHeader className="flex flex-row items-center gap-4">
                    <Package className="h-6 w-6" />
                    <CardTitle>Solicitudes a Almacén</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Solicitud</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Artículos</TableHead>
                                <TableHead className="text-right">Fecha Requerida</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {warehouseRequests.length > 0 ? warehouseRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.id}</TableCell>
                                    <TableCell><Badge variant={requestStatusVariant[req.status]}>{requestStatusTranslate[req.status]}</Badge></TableCell>
                                    <TableCell>{Array.isArray(req.items) ? req.items.map((item: any) => `${item.itemName} (x${item.quantity})`).join(', ') : ''}</TableCell>
                                    <TableCell className="text-right"><ClientDate value={req.requiredByDate} /></TableCell>
                                </TableRow>
                           )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No hay solicitudes a almacén para este proyecto.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Miembros del Equipo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {teamMembers.length > 0 ? teamMembers.map((user) => (
                        <div key={user.id} className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 relative">
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                            </Avatar>
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.role}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground">No hay miembros en el equipo.</p>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      <Dialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> Sugerencias de IA</DialogTitle>
            <DialogDescription>
              Revisa las sugerencias generadas por la IA. Puedes crearlas automáticamente en el sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isGenerating ? (
              <p className="text-center text-muted-foreground">Generando sugerencias, por favor espera...</p>
            ) : (
              <Textarea
                value={aiSuggestions}
                readOnly
                rows={15}
                className="min-h-[300px]"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAiModalOpen(false)} disabled={isCreating}>Cerrar</Button>
            <Button 
              onClick={handleCreateItems} 
              disabled={isGenerating || isCreating || !parsedSuggestions}
            >
              {isCreating ? "Creando..." : "Crear Elementos Sugeridos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}