
'use client'

import { useMemo, useEffect, useState } from 'react';
import { type Invoice, type Project, type Client, type Task, type User, type Ticket } from '@/lib/definitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Briefcase, Users, CheckCircle, BarChart, LineChart as LineChartIcon, Ticket as TicketIcon } from 'lucide-react';
import { ClientNumber, ClientOnly } from '@/components/client-only';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { es } from 'date-fns/locale';
import { format, differenceInHours } from 'date-fns';
import { PageHeader } from '@/components/page-header';
import { ResponsiveContainer, BarChart as RechartsBarChart, XAxis, YAxis, Tooltip, Legend, Bar, LineChart as RechartsLineChart, Line, CartesianGrid } from 'recharts';
import { useTheme } from 'next-themes';


type AnalyticsClientProps = {
    invoices: Invoice[];
    projects: Project[];
    clients: Client[];
    tasks: Task[];
    users: User[];
    tickets: Ticket[];
};

export function AnalyticsClient({ invoices, projects, clients, tasks, users, tickets }: AnalyticsClientProps) {
    const [hasMounted, setHasMounted] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const kpis = useMemo(() => {
        const totalRevenue = invoices
            .filter(inv => inv.status === 'Paid')
            .reduce((acc, inv) => acc + inv.amount, 0);

        const projectsCompleted = projects.filter(p => p.status === 'Completed').length;
        
        const totalClients = clients.length;

        const tasksCompleted = tasks.filter(t => t.status === 'Done').length;
        const taskCompletionRate = tasks.length > 0 ? (tasksCompleted / tasks.length) * 100 : 0;
        
        const openTickets = tickets.filter(t => t.status !== 'Closed').length;

        return {
            totalRevenue,
            projectsCompleted,
            totalClients,
            taskCompletionRate,
            openTickets,
        };
    }, [invoices, projects, clients, tasks, tickets]);

    const monthlyRevenue = useMemo(() => {
        const data: { [key: string]: number } = {};
        invoices
            .filter(inv => inv.status === 'Paid')
            .forEach(inv => {
                const month = format(new Date(inv.issueDate), 'yyyy-MM');
                if (!data[month]) {
                    data[month] = 0;
                }
                data[month] += inv.amount;
            });
        
        return Object.entries(data)
            .map(([month, revenue]) => ({
                name: format(new Date(month + '-02'), 'MMM yy', { locale: es }),
                Ingresos: revenue,
            }))
            .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    }, [invoices]);

    const ticketStatusData = useMemo(() => {
        const statusCounts = tickets.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as Record<Ticket['status'], number>);
        
        return Object.entries(statusCounts).map(([name, value]) => ({ name, Tickets: value }));
    }, [tickets]);


    const salesPerformance = useMemo(() => {
        const agentRoles: User['role'][] = ['Agent', 'Admin', 'Super-Admin'];
        const salesAgents = users.filter(u => agentRoles.includes(u.role));

        return salesAgents.map(agent => {
            const agentInvoices = invoices.filter(inv => inv.salespersonId === agent.id && inv.status === 'Paid');
            const totalSales = agentInvoices.reduce((acc, inv) => acc + inv.amount, 0);
            const projectsManaged = projects.filter(p => p.team.includes(agent.id)).length;
            const commissionRate = 0.03; // Simplified for this example
            const totalCommission = totalSales * commissionRate;

            return {
                id: agent.id,
                name: agent.name,
                totalSales,
                projectsManaged,
                invoicesCount: agentInvoices.length,
                totalCommission,
            };
        }).sort((a,b) => b.totalSales - a.totalSales);
    }, [users, invoices, projects]);

    const ticketResolutionTime = useMemo(() => {
        const resolvedTickets = tickets.filter(t => t.status === 'Closed' && t.closedAt);
        if (resolvedTickets.length === 0) return 'N/A';
        const totalHours = resolvedTickets.reduce((acc, t) => {
            if (!t.closedAt) return acc;
            return acc + differenceInHours(new Date(t.closedAt), new Date(t.createdAt));
        }, 0);
        const avgHours = totalHours / resolvedTickets.length;
        return `${avgHours.toFixed(1)} horas`;
    }, [tickets]);

    if (!hasMounted) {
        return (
             <>
                 <PageHeader
                    title="Análisis y Reportes"
                    description="Una vista detallada del rendimiento de tu negocio y equipo."
                />
                <div>Cargando datos de análisis...</div>
            </>
        )
    }

    const tickColor = theme === 'dark' ? '#888888' : '#333333';

    return (
        <>
            <PageHeader
                title="Análisis y Reportes"
                description="Una vista detallada del rendimiento de tu negocio y equipo."
            />
            <div className="space-y-8">
                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos Totales (Pagado)</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold"><ClientNumber value={kpis.totalRevenue} /></div>
                            <p className="text-xs text-muted-foreground">de todas las facturas pagadas</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Proyectos Completados</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.projectsCompleted}</div>
                            <p className="text-xs text-muted-foreground">de un total de {projects.length} proyectos</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{kpis.totalClients}</div>
                            <p className="text-xs text-muted-foreground">desde el inicio de operaciones</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tickets Abiertos</CardTitle>
                            <TicketIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{kpis.openTickets}</div>
                            <p className="text-xs text-muted-foreground">de {tickets.length} tickets totales</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Resolución Tickets</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <ClientOnly>{ticketResolutionTime}</ClientOnly>
                            </div>
                            <p className="text-xs text-muted-foreground">tiempo promedio de cierre</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><LineChartIcon className="h-5 w-5" /> Ingresos por Mes</CardTitle>
                            <CardDescription>Facturas pagadas a lo largo del tiempo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsLineChart data={monthlyRevenue}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fill: tickColor }} />
                                        <YAxis tick={{ fill: tickColor }} tickFormatter={(val: number) => val.toLocaleString('es-DO', { style: 'currency', currency: 'DOP', notation: 'compact' })} />
                                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', border: '1px solid #ccc' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="Ingresos" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                                    </RechartsLineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" /> Tickets por Estado</CardTitle>
                            <CardDescription>Distribución actual de los tickets.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={ticketStatusData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fill: tickColor }} />
                                        <YAxis tick={{ fill: tickColor }} />
                                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#333' : '#fff', border: '1px solid #ccc' }} />
                                        <Legend />
                                        <Bar dataKey="Tickets" fill="hsl(var(--primary))" />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sales Performance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Rendimiento por Vendedor</CardTitle>
                        <CardDescription>Análisis de ventas, proyectos y comisiones por cada agente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vendedor</TableHead>
                                    <TableHead className="text-right">Ventas Totales</TableHead>
                                    <TableHead className="text-center"># Facturas</TableHead>
                                    <TableHead className="text-center"># Proyectos</TableHead>
                                    <TableHead className="text-right">Comisión Estimada</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salesPerformance.map(agent => (
                                    <TableRow key={agent.id}>
                                        <TableCell className="font-medium">{agent.name}</TableCell>
                                        <TableCell className="text-right"><ClientNumber value={agent.totalSales} /></TableCell>
                                        <TableCell className="text-center">{agent.invoicesCount}</TableCell>
                                        <TableCell className="text-center">{agent.projectsManaged}</TableCell>
                                        <TableCell className="text-right font-semibold"><ClientNumber value={agent.totalCommission} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
