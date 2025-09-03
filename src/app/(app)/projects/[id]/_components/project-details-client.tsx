

'use client';

import { useState, useEffect, useMemo } from 'react';
import { getTasks, getWarehouseRequests, type Project, type Task, type WarehouseRequest, type User } from "@/lib/definitions"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Edit, Package, ListTodo } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ClientDate } from "@/components/client-only";

const POLLING_INTERVAL = 5000; // 5 seconds

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

export function ProjectDetailsClient({ initialProject, initialTasks, initialWarehouseRequests, allUsers }: ProjectDetailsClientProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [warehouseRequests, setWarehouseRequests] = useState<WarehouseRequest[]>(initialWarehouseRequests);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize team members to avoid re-calculating on every render
  const teamMembers = useMemo(() => 
    allUsers.filter(user => project.team.includes(user.id)),
    [allUsers, project.team]
  );
  
  useEffect(() => {
    const pollData = async () => {
      // No need to show loading spinner for background polling
      const allTasks = await getTasks();
      const allRequests = await getWarehouseRequests();
      setTasks(allTasks.filter(task => task.projectId === project.id));
      setWarehouseRequests(allRequests.filter(req => req.projectId === project.id));
    };

    const intervalId = setInterval(pollData, POLLING_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [project.id]);


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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.length > 0 ? tasks.map(task => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell><Badge variant={taskStatusVariant[task.status]}>{taskStatusTranslate[task.status]}</Badge></TableCell>
                                    <TableCell className="text-right"><ClientDate value={task.dueDate} /></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">No hay tareas para este proyecto.</TableCell>
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
                                    <TableCell className="text-center">{req.items.length}</TableCell>
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
    </>
  )
}
