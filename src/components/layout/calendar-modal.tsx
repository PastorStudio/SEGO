
'use client'

import { useState, useEffect, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import { format, getDay, parse, startOfWeek, addDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon } from 'lucide-react';
import { getProjects, getTasks, getInvoices, getWarehouseRequests } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EventDetails } from './event-details';
import { useAuth } from '@/hooks/use-auth.tsx';
import { type User, type Project, type Invoice, type WarehouseRequest, type Task } from "@/lib/definitions";

export type EventType = 'project' | 'task' | 'invoice' | 'request';

export type CalendarEvent = {
    start: Date;
    end: Date;
    title: string;
    resource: {
      type: EventType;
      status: Project['status'] | Task['status'] | Invoice['status'] | WarehouseRequest['status'];
      id: string;
    };
}

const locales = {
  'es': es,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: es }),
  getDay,
  locales,
})

const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango.',
    showMore: (total: number) => `+ Ver más (${total})`
};


export function CalendarView({ setCalendarOpen }: { setCalendarOpen: (open: boolean) => void }) {
    const { currentUser } = useAuth();
    const [view, setView] = useState<View>(Views.MONTH);
    const [date, setDate] = useState(new Date());
    const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        projects: true,
        tasks: true,
        invoices: true,
        requests: true,
    });
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    
    const isViewer = currentUser?.role === 'Viewer';

    useEffect(() => {
        if (isViewer) {
            setFilters(prev => ({ ...prev, invoices: false }));
        }
    }, [isViewer])

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true);

            const dataPromises = [
                getProjects(),
                getTasks(),
                isViewer ? Promise.resolve([]) : getInvoices(),
                getWarehouseRequests()
            ];

            const [projects, tasks, invoices, requests] = await Promise.all(dataPromises);

            const projectEvents: CalendarEvent[] = projects.map(p => {
                const startDate = startOfDay(new Date((p as Project).dueDate));
                return {
                    start: startDate,
                    end: addDays(startDate, 1),
                    title: (p as Project).name,
                    resource: { type: 'project', status: p.status, id: p.id }
                }
            });

            const taskEvents: CalendarEvent[] = tasks.map(t => {
                const startDate = startOfDay(new Date((t as Task).dueDate));
                return {
                    start: startDate,
                    end: addDays(startDate, 1),
                    title: (t as Task).title,
                    resource: { type: 'task', status: t.status, id: t.id }
                }
            });
            
            const invoiceEvents: CalendarEvent[] = invoices.map(i => {
                 const startDate = startOfDay(new Date((i as Invoice).dueDate));
                 return {
                    start: startDate,
                    end: addDays(startDate, 1),
                    title: `Factura ${i.id}`,
                    resource: { type: 'invoice', status: i.status, id: i.id }
                }
            });
            
            const requestEvents: CalendarEvent[] = requests.map(r => {
                 const startDate = startOfDay(new Date((r as WarehouseRequest).requiredByDate));
                 return {
                    start: startDate,
                    end: addDays(startDate, 1),
                    title: `Pedido ${r.id}`,
                    resource: { type: 'request', status: r.status, id: r.id }
                }
            });

            setAllEvents([...projectEvents, ...taskEvents, ...invoiceEvents, ...requestEvents]);
            setLoading(false);
        }
        fetchEvents();
    }, [isViewer]);

    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            if (event.resource.type === 'project' && filters.projects) return true;
            if (event.resource.type === 'task' && filters.tasks) return true;
            if (event.resource.type === 'invoice' && filters.invoices) return true;
            if (event.resource.type === 'request' && filters.requests) return true;
            return false;
        });
    }, [allEvents, filters]);


    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = 'hsl(var(--muted))';
        let color = 'hsl(var(--muted-foreground))';

        switch(event.resource.type) {
            case 'project': 
                backgroundColor = 'hsl(var(--primary))';
                color = 'hsl(var(--primary-foreground))';
                break;
            case 'task':
                backgroundColor = 'hsl(var(--secondary))';
                color = 'hsl(var(--secondary-foreground))';
                break;
            case 'invoice':
                backgroundColor = 'hsl(var(--accent))';
                color = 'hsl(var(--accent-foreground))';
                break;
            case 'request':
                 backgroundColor = 'hsl(var(--chart-2))'; // Using a chart color
                 color = 'hsl(var(--primary-foreground))';
                 break;
        }

        const style = { backgroundColor, color, borderRadius: '5px', border: 'none', display: 'block', opacity: 0.8, cursor: 'pointer' };
        return { style };
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsDetailsOpen(true);
    };


    const CustomToolbar = ({ label, onNavigate }: any) => {
      return (
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 p-2 md:p-4 rounded-t-lg">
        <div className="flex items-center gap-2 mb-4 sm:mb-0">
          <Button size="sm" onClick={() => onNavigate('TODAY')}>Hoy</Button>
          <Button size="sm" variant="outline" onClick={() => onNavigate('PREV')}>Anterior</Button>
          <Button size="sm" variant="outline" onClick={() => onNavigate('NEXT')}>Siguiente</Button>
        </div>
        <h2 className="text-lg md:text-xl font-bold text-center">
          {label}
        </h2>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button size="sm" variant={view === Views.MONTH ? 'default' : 'outline'} onClick={() => setView(Views.MONTH)}>Mes</Button>
          <Button size="sm" variant={view === Views.WEEK ? 'default' : 'outline'} onClick={() => setView(Views.WEEK)}>Semana</Button>
          <Button size="sm" variant={view === Views.DAY ? 'default' : 'outline'} onClick={() => setView(Views.DAY)}>Día</Button>
        </div>
      </div>
    )};
    
    const handleFilterChange = (filterName: keyof typeof filters) => {
        setFilters(prev => ({ ...prev, [filterName]: !prev[filterName] }));
    }

    return (
      <>
        <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-2 border-b">
            <div className="flex items-center space-x-2">
                <Checkbox id="filter-projects" checked={filters.projects} onCheckedChange={() => handleFilterChange('projects')} />
                <Label htmlFor="filter-projects" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    <Badge className="bg-primary hover:bg-primary/90">Proyectos</Badge>
                </Label>
            </div>
             <div className="flex items-center space-x-2">
                <Checkbox id="filter-tasks" checked={filters.tasks} onCheckedChange={() => handleFilterChange('tasks')} />
                <Label htmlFor="filter-tasks" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    <Badge variant="secondary">Tareas</Badge>
                </Label>
            </div>
            {!isViewer && (
                <div className="flex items-center space-x-2">
                    <Checkbox id="filter-invoices" checked={filters.invoices} onCheckedChange={() => handleFilterChange('invoices')} />
                    <Label htmlFor="filter-invoices" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    <Badge className="bg-accent hover:bg-accent/90 text-accent-foreground">Facturas</Badge>
                    </Label>
                </div>
            )}
             <div className="flex items-center space-x-2">
                <Checkbox id="filter-requests" checked={filters.requests} onCheckedChange={() => handleFilterChange('requests')} />
                <Label htmlFor="filter-requests" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    <Badge className="bg-chart-2 hover:bg-chart-2/90 text-primary-foreground">Pedidos</Badge>
                </Label>
            </div>
        </div>
        <div className="h-[calc(100vh-220px)]">
            {loading ? (
                 <div className="flex items-center justify-center h-full">Cargando eventos...</div>
            ) : (
                <BigCalendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    view={view}
                    date={date}
                    onView={(view: View) => setView(view)}
                    onNavigate={(newDate: Date) => setDate(newDate)}
                    messages={messages}
                    eventPropGetter={eventStyleGetter}
                    onSelectEvent={handleSelectEvent}
                    components={{
                        toolbar: CustomToolbar
                    }}
                    culture='es'
                />
            )}
        </div>
         {selectedEvent && (
            <EventDetails 
                event={selectedEvent} 
                isOpen={isDetailsOpen} 
                onOpenChange={setIsDetailsOpen}
                setCalendarOpen={setCalendarOpen} 
            />
        )}
      </>
    );
}


export function CalendarModal({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-2 sm:p-4">
                <DialogHeader className="p-2">
                    <DialogTitle>Calendario de Eventos</DialogTitle>
                </DialogHeader>
                <div className="flex-grow min-h-0">
                   <CalendarView setCalendarOpen={onOpenChange} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
