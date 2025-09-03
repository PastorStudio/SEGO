
'use client';

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type Task, type Project } from "@/lib/data"
import { ClientDate } from "@/components/client-only";

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

    const getProjectName = (projectId: string) => {
        return projects.find(p => p.id === projectId)?.name || "N/A";
    }

    return (
        <Card>
            <CardContent className="pt-6">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>ID Tarea</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden sm:table-cell">Proyecto</TableHead>
                    <TableHead className="hidden sm:table-cell">Estado</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha Entrega</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {tasks.length > 0 ? tasks.map((task) => (
                    <TableRow key={task.id}>
                    <TableCell>
                        <div className="font-medium">{task.id}</div>
                    </TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">{getProjectName(task.projectId)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge variant={statusVariant[task.status]}>{statusTranslate[task.status]}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell"><ClientDate value={task.dueDate} /></TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center">No hay tareas para mostrar.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    )
}
