
'use server'

import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, ShieldCheck, ListChecks, Sparkles, MessageCircle, Ticket, Users, Activity } from "lucide-react";
import Link from "next/link";
import { getUsers, getProjects, getTickets } from "@/lib/data";

type ManagementLink = {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    value?: string;
    valueLabel?: string;
}

export default async function AdminSupervisionPage() {
    
    const [users, projects, tickets] = await Promise.all([
        getUsers(),
        getProjects(),
        getTickets(),
    ]);

    const onlineUsers = users.filter(u => u.status === 'online').length;
    const activeProjects = projects.filter(p => p.status === 'On Track').length;
    const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
    

    const managementLinks: ManagementLink[] = [
        { 
            title: "Gestión de Roles y Permisos", 
            description: "Definir accesos y capacidades por rol.", 
            href: "/settings", 
            icon: ShieldCheck,
            value: `${users.length}`,
            valueLabel: 'Usuarios Totales'
        },
        { 
            title: "Supervisión de Proyectos", 
            description: "Ver el estado y progreso de todos los proyectos.", 
            href: "/projects", 
            icon: Sparkles,
            value: `${activeProjects}`,
            valueLabel: 'Proyectos Activos'
        },
        { 
            title: "Asignación de Tareas", 
            description: "Revisar y asignar tareas inmediatas al equipo.", 
            href: "/immediate-work", 
            icon: ListChecks,
        },
        { 
            title: "Análisis y Reportes", 
            description: "Explorar métricas clave y rendimiento.", 
            href: "/analytics", 
            icon: BarChart3,
            value: `${onlineUsers}`,
            valueLabel: 'Usuarios Conectados'
        },
        { 
            title: "Supervisión de Tickets", 
            description: "Monitorear el estado de los tickets de soporte.", 
            href: "/tickets", 
            icon: Ticket,
            value: `${openTickets}`,
            valueLabel: 'Tickets Abiertos'
        },
        { 
            title: "Comunicación del Equipo", 
            description: "Acceder al chat interno del equipo.", 
            href: "/chat", 
            icon: MessageCircle 
        },
    ]

    return (
        <>
            <PageHeader 
                title="Administración y Supervisión"
                description="Panel central para la gestión de equipos, permisos y procesos clave."
            />
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managementLinks.map((link) => (
                    <Card key={link.title} className="flex flex-col">
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
                            <div className="p-3 bg-primary/10 rounded-md">
                                <link.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle>{link.title}</CardTitle>
                                <CardDescription className="mt-1">{link.description}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            {link.value && (
                                <div className="mb-4">
                                    <p className="text-3xl font-bold">{link.value}</p>
                                    <p className="text-xs text-muted-foreground">{link.valueLabel}</p>
                                </div>
                            )}
                           <Button asChild className="w-full">
                             <Link href={link.href}>
                                Acceder <ArrowRight className="ml-2 h-4 w-4" />
                             </Link>
                           </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    )
}
