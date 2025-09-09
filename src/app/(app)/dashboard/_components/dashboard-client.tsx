
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Briefcase, CheckSquare, Activity, ListChecks, Package, AtSign, ShoppingCart, UserPlus, BarChart, FileText, LineChart as LineChartIcon, DollarSign, Ticket } from 'lucide-react'
import { PageHeader } from "@/components/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { type Project, type Task, type Client, type WarehouseRequest, type ImmediateTask, type User, type Invoice, type Ticket as TicketType } from "@/lib/definitions";
import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth.tsx";
import { ClientDate, ClientNumber } from "@/components/client-only";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClientOnly } from "@/components/client-only";

type RecentActivityItem = 
    (Task & { type: 'task', sortDate: string }) | 
    (WarehouseRequest & { type: 'warehouse', sortDate: string }) |
    ({ 
      type: 'mention', 
      id: string, 
      commenterName: string, 
      mentionedUserName: string,
      contextText: string,
      link: string, 
      sortDate: string, 
      icon: React.ElementType 
    });


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

type DashboardClientProps = {
    projects: Project[];
    tasks: Task[];
    clients: Client[];
    warehouseRequests: WarehouseRequest[];
    immediateTasks: ImmediateTask[];
    users: User[];
    invoices: Invoice[];
    tickets: TicketType[];
};


export function DashboardClient({ projects, tasks, clients, warehouseRequests, immediateTasks, users, invoices, tickets }: DashboardClientProps) {
  const { currentUser } = useAuth();
  
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;

  const kpis = useMemo(() => {
    const unpaidInvoices = invoices.filter(
      inv => inv.status === 'Pending' || inv.status === 'Overdue'
    ).length;

    const pendingTickets = tickets.filter(
        t => t.status === 'Abierto' || t.status === 'En Progreso'
    ).length;

    const pendingProjectTasks = tasks.filter(
        t => t.status === 'In Progress' || t.status === 'To Do'
    ).length;

    const pendingImmediateTasks = immediateTasks.filter(
        t => t.status === 'pending'
    ).length;

    const pendingTasks = pendingProjectTasks + pendingImmediateTasks;

    const pendingProjects = projects.filter(p => p.status !== 'Completed').length;

    return {
      pendingProjects,
      unpaidInvoices,
      pendingTickets,
      pendingTasks,
    }
  }, [projects, invoices, tickets, immediateTasks, tasks]);

  const recentActivity = useMemo(() => {
    const newTasks: RecentActivityItem[] = tasks.map(t => ({ ...t, type: 'task', sortDate: t.dueDate }));
    const completedRequests: RecentActivityItem[] = warehouseRequests
      .filter(r => r.status === 'Completed')
      .map(r => ({ ...r, type: 'warehouse', sortDate: r.requestDate }));
    
    const mentionActivities: RecentActivityItem[] = [];

    // Mentions from Warehouse Requests
    warehouseRequests.forEach(req => {
        (req.comments || []).forEach(comment => {
            const mentions = comment.content.matchAll(mentionRegex);
            for(const mention of mentions) {
                const mentionedUserName = mention[1];
                const commenterName = userMap.get(comment.userId)?.name || 'Alguien';
                mentionActivities.push({
                    type: 'mention',
                    id: comment.id,
                    commenterName,
                    mentionedUserName,
                    contextText: `en la solicitud ${req.id}`,
                    link: `/warehouse`,
                    sortDate: comment.createdAt,
                    icon: Package
                });
            }
        });
    });

    // Mentions from Immediate Tasks
    immediateTasks.forEach(task => {
        (task.comments || []).forEach(comment => {
             const mentions = comment.content.matchAll(mentionRegex);
             for(const mention of mentions) {
                const mentionedUserName = mention[1];
                const commenterName = userMap.get(comment.userId)?.name || 'Alguien';
                mentionActivities.push({
                    type: 'mention',
                    id: comment.id,
                    commenterName,
                    mentionedUserName,
                    contextText: `en "${task.title}"`,
                    link: `/immediate-work`,
                    sortDate: comment.createdAt,
                    icon: ListChecks
                });
             }
        });
    });
      
    const combinedActivity = [...newTasks, ...completedRequests, ...mentionActivities];
    combinedActivity.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
    
    return combinedActivity.slice(0, 5);
  }, [tasks, warehouseRequests, immediateTasks, userMap]);

  const sortedProjects = useMemo(() => 
    [...projects].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
    [projects]
  );
  
  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || "N/A";
  }

  const renderActivity = (activity: RecentActivityItem) => {
      let icon: React.ReactNode;
      let title: React.ReactNode;
      let description: React.ReactNode;
      let date: string;

      switch(activity.type) {
        case 'task':
            icon = <ListChecks className="h-5 w-5 text-muted-foreground" />;
            title = activity.title;
            description = <>Para el proyecto: <Link href={`/projects/${activity.projectId}`} className="font-semibold text-foreground hover:underline">{getProjectName(activity.projectId)}</Link></>;
            date = activity.dueDate;
            break;
        case 'warehouse':
            icon = <Package className="h-5 w-5 text-muted-foreground" />;
            title = `Solicitud de almacén ${activity.id} completada`;
            description = <>Para el proyecto: <Link href={`/projects/${activity.projectId}`} className="font-semibold text-foreground hover:underline">{getProjectName(activity.projectId)}</Link></>;
            date = activity.requestDate;
            break;
        case 'mention':
            const MentionIcon = activity.icon;
            icon = <MentionIcon className="h-5 w-5 text-muted-foreground" />;
            title = (
                <Link href={activity.link} className="hover:underline">
                    {activity.commenterName} mencionó a <strong className="text-primary">{activity.mentionedUserName}</strong>
                </Link>
            )
            description = <span className="flex items-center gap-1"><AtSign className="h-3 w-3" /> {activity.contextText}</span>;
            date = activity.sortDate;
            break;
        default:
            return null;
      }
      
      return (
        <div key={`${(activity as any).type}-${(activity as any).id}`} className="flex items-start gap-4">
            <div className="bg-secondary p-2 rounded-full">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium leading-none">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
                <ClientDate value={date} />
            </div>
        </div>
      );
  }

  return (
    <>
      <PageHeader 
        title="Dashboard" 
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-500 text-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-md">
                <FileText className="h-8 w-8" />
            </div>
            <div>
                <p className="text-sm font-bold">Proyectos Pendientes</p>
                <p className="text-2xl font-bold">{kpis.pendingProjects}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-white">
            <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-600 p-4 rounded-md">
                <DollarSign className="h-8 w-8" />
            </div>
            <div>
                <p className="text-sm font-bold">Cuentas por Cobrar</p>
                <p className="text-2xl font-bold">{kpis.unpaidInvoices}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500 text-white">
            <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-yellow-600 p-4 rounded-md">
                <Ticket className="h-8 w-8" />
            </div>
            <div>
                <p className="text-sm font-bold">Tickets Pendientes</p>
                <p className="text-2xl font-bold">{kpis.pendingTickets}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500 text-white">
            <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-red-600 p-4 rounded-md">
                <ListChecks className="h-8 w-8" />
            </div>
            <div>
                <p className="text-sm font-bold">Tareas sin Completar</p>
                <p className="text-2xl font-bold">{kpis.pendingTasks}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
             <CardHeader>
                <CardTitle>Proyectos Recientes</CardTitle>
                <CardDescription>Una vista de los proyectos con fechas de entrega próximas.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Proyecto</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-right">Fecha de Entrega</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedProjects.slice(0, 5).map(project => (
                             <TableRow key={project.id}>
                                <TableCell>
                                    <div className="font-medium">{project.name}</div>
                                </TableCell>
                                <TableCell>{project.client}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={statusVariant[project.status]}>{statusTranslate[project.status]}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <ClientDate value={project.dueDate} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Un registro de las últimas acciones en el sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ClientOnly>
                 {recentActivity.length > 0 ? recentActivity.map(activity => renderActivity(activity)) : (
                     <div className="text-center text-muted-foreground py-8">
                        No hay actividad reciente.
                    </div>
                )}
                </ClientOnly>
            </CardContent>
        </Card>
      </div>
    </>
  )
}
