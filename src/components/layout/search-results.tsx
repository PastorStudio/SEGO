
'use client'

import { type SearchResult } from "@/lib/data";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";
import { Briefcase, User, Ticket as TicketIcon, FileText, CheckSquare, Users } from 'lucide-react';
import { Skeleton } from "../ui/skeleton";

type SearchResultsProps = {
    results: SearchResult[];
    isLoading: boolean;
    onClose: () => void;
};

const ICONS = {
    projects: Briefcase,
    clients: Users,
    users: User,
    invoices: FileText,
    tasks: CheckSquare,
    tickets: TicketIcon,
};

const GROUP_TITLES = {
    projects: 'Proyectos',
    clients: 'Clientes',
    users: 'Usuarios',
    invoices: 'Facturas',
    tasks: 'Tareas',
    tickets: 'Tickets',
};

export function SearchResults({ results, isLoading, onClose }: SearchResultsProps) {
    
    const groupedResults = results.reduce((acc, result) => {
        const key = result.type;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(result);
        return acc;
    }, {} as Record<string, SearchResult[]>);

    const hasResults = results.length > 0;

    return (
        <div className="absolute top-full mt-2 w-full max-w-sm rounded-lg border bg-background shadow-lg z-50">
            <ScrollArea className="max-h-96">
                <div className="p-2">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground space-y-2">
                            <Skeleton className="h-4 w-20 mx-auto" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ) : hasResults ? (
                        Object.entries(groupedResults).map(([type, items]) => {
                            const Icon = ICONS[type as keyof typeof ICONS];
                            const title = GROUP_TITLES[type as keyof typeof GROUP_TITLES];

                            return (
                                <div key={type}>
                                    <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1.5">{title}</h4>
                                    <ul>
                                        {items.map(item => (
                                            <li key={item.id}>
                                                <Link
                                                    href={item.url}
                                                    onClick={onClose}
                                                    className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                                                >
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{item.title}</p>
                                                        {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })
                    ) : (
                        <p className="p-4 text-center text-sm text-muted-foreground">No se encontraron resultados.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
