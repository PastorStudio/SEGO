
'use client'

import { type Project, type User, getUsers } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ProjectActions } from "./project-actions"
import { ClientDate } from "@/components/client-only"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/avatars"
import { useEffect, useState } from "react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

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

const rowColorVariant: { [key in Project['status']]?: string } = {
  "Off Track": "bg-red-500/10 hover:bg-red-500/20",
  "Completed": "bg-green-500/10 hover:bg-green-500/20",
}

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}

export function ProjectList({ projects }: { projects: Project[] }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
        const usersData = await getUsers();
        setUsers(usersData);
    }
    fetchUsers();
  }, []);
  
  const getUserById = (id: string) => users.find(u => u.id === id);

  return (
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Estado</TableHead>
                <TableHead className="hidden lg:table-cell">Equipo</TableHead>
                <TableHead>Fecha Entrega</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length > 0 ? projects.map((project) => (
                <TableRow key={project.id} className={cn(rowColorVariant[project.status])}>
                  <TableCell>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">{project.id}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{project.client}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={statusVariant[project.status]}>{statusTranslate[project.status]}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <TooltipProvider>
                      <div className="flex -space-x-2 overflow-hidden">
                        {project.team.map((userId, index) => {
                          const user = getUserById(userId);
                           return (
                               <Tooltip key={index}>
                                   <TooltipTrigger asChild>
                                      <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                                          <AvatarImage src={getAvatarUrl(user?.avatar, user?.name)} alt={user?.name} />
                                          <AvatarFallback>{user ? getInitials(user.name) : '?'}</AvatarFallback>
                                      </Avatar>
                                   </TooltipTrigger>
                                   <TooltipContent>
                                       <p>{user?.name || 'Usuario desconocido'}</p>
                                   </TooltipContent>
                               </Tooltip>
                           )
                        })}
                      </div>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell><ClientDate value={project.dueDate} /></TableCell>
                  <TableCell>{project.dueTime}</TableCell>
                   <TableCell className="text-right">
                      <ProjectActions project={project} />
                    </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No hay proyectos para mostrar.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  )
}
