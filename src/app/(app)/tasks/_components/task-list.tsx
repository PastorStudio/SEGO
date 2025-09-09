'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { updateTaskStatus } from "@/lib/data";
import type { Task, Project } from "@/lib/definitions";
import { ClientDate } from "@/components/client-only";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
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
import { useToast } from "@/hooks/use-toast";

const statusVariant: { [key in Task['status']]: "default" | "secondary" | "outline" } = {
  "Done": "secondary",
  "In Progress": "default",
  "To Do": "outline",
}

const statusTranslate: { [key in Task['status']]: string } = {
  "Done": "Hecho",
  "In Progress": "En Progreso",
  "To Do": "Por Hacer",
}

type TaskListProps = {
    tasks: Task[];
    projects: Project[];
}

export function TaskList({ tasks, projects }: TaskListProps) {
    const { toast } = useToast();
    const [isUpdatingTask, setIsUpdatingTask] = useState<string | null>(null);

    const getProjectName = (projectId: string) => {
        return projects.find(p => p.id === projectId)?.name || "N/A";
    }

    const handleStatusChange = async (taskId: string, status: Task['status']) => {
      setIsUpdatingTask(taskId);
      try {
        await updateTaskStatus(taskId, status);
        toast({ title: "Estado Actualizado", description: "La tarea ha sido actualizada." });
      } catch (error) {
        console.error("Failed to update task status", error);
        toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
      } finally {
        setIsUpdatingTask(null);
      }
    };

    return (
        <Card>
            <CardContent className="pt-6">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>ID Tarea</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Entrega</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {tasks.length > 0 ? tasks.map((task) => (
                    <TableRow key={task.id}>
                    <TableCell>
                        <div className="font-medium">{task.id}</div>
                    </TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{getProjectName(task.projectId)}</TableCell>
                    <TableCell>
                        <Badge variant={statusVariant[task.status]}>{statusTranslate[task.status]}</Badge>
                    </TableCell>
                    <TableCell><ClientDate value={task.dueDate} /></TableCell>
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
                        <TableCell colSpan={6} className="text-center">No hay tareas para mostrar.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    )
}