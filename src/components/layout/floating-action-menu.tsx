
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Ticket, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateTicketModal } from '@/app/(app)/tickets/_components/create-ticket-modal';
import { CalendarModal } from '@/components/layout/calendar-modal';
import type { User, Client } from '@/lib/definitions';

type FloatingActionMenuProps = {
    users: User[];
    clients: Client[];
}

export function FloatingActionMenu({ users, clients }: FloatingActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

    const toggleMenu = () => setIsOpen(prev => !prev);
    
    const fabStyle = "h-12 w-12 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-110 active:scale-105 z-50";

    return (
        <TooltipProvider>
            <div className="fixed bottom-6 right-6 flex flex-col items-center gap-3">
                {/* Action Buttons */}
                <div 
                    className={cn(
                        "flex flex-col items-center gap-3 transition-all duration-300 ease-in-out",
                        isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                    )}
                >
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="destructive"
                                className={cn(fabStyle, "h-11 w-11")}
                                style={{ boxShadow: '0 4px 14px 0 hsl(var(--destructive) / 25%)' }}
                                onClick={() => setIsTicketModalOpen(true)}
                            >
                                <Ticket className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left"><p>Crear Ticket</p></TooltipContent>
                    </Tooltip>
                    
                     <Tooltip>
                        <TooltipTrigger asChild>
                             <Button
                                variant="default"
                                className={cn(fabStyle, "h-11 w-11")}
                                style={{ boxShadow: '0 4px 14px 0 hsl(var(--primary) / 25%)' }}
                                onClick={() => setIsCalendarModalOpen(true)}
                            >
                                <Calendar className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left"><p>Abrir Calendario</p></TooltipContent>
                    </Tooltip>
                </div>

                {/* Main Toggle Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Button
                            variant="secondary"
                            onClick={toggleMenu}
                            className={cn(fabStyle, "bg-card border-2 border-primary/50 text-primary hover:bg-secondary/80")}
                        >
                            <Plus className={cn("absolute transition-transform duration-300", isOpen ? "rotate-45 scale-0" : "rotate-0 scale-100")} />
                            <X className={cn("absolute transition-transform duration-300", isOpen ? "rotate-0 scale-100" : "-rotate-45 scale-0")} />
                            <span className="sr-only">Toggle Actions</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>{isOpen ? 'Cerrar Menú' : 'Abrir Acciones'}</p></TooltipContent>
                </Tooltip>
            </div>
            
            {/* Modals are rendered here but triggered from the buttons */}
            <CreateTicketModal users={users} clients={clients} isOpen={isTicketModalOpen} onOpenChange={setIsTicketModalOpen} />
            <CalendarModal isOpen={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen} />
        </TooltipProvider>
    );
}
