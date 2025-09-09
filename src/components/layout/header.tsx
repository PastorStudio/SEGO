
'use client'

import { Search, Bell, MessageSquare, Flag, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from 'next/link';
import { getNotifications, markNotificationsAsRead, searchGlobal, getProjects, getImmediateTasks, getTickets } from '@/lib/data';
import { type Notification, type SearchResult, type Project, type ImmediateTask, type Ticket } from '@/lib/definitions';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/hooks/use-auth.tsx';
import { ClientOnly } from '../client-only';
import { Logo } from '../logo';
import { SearchResults } from './search-results';
import { useDebounce } from '@/hooks/use-debounce';
import { getAvatarUrl } from '@/lib/avatars';
import { SupportTicketModal } from '@/app/(app)/tickets/_components/create-ticket-modal';
import { ClockModal } from "@/components/clock-modal";

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}

function DynamicGreeting() {
    const { currentUser } = useAuth();
    const [greeting, setGreeting] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [pendingSummary, setPendingSummary] = useState('');

    useEffect(() => {
        const getGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) return "Buenos días";
            if (hour < 18) return "Buenas tardes";
            return "Buenas noches";
        }
        setGreeting(getGreeting());

        const timer = setInterval(() => {
            const now = new Date();
            const formattedDate = format(now, "'hoy es' dd 'de' MMMM", { locale: es });
            const formattedTime = format(now, "h:mm:ss a");
            setDateTime(`${formattedDate} y la hora es ${formattedTime}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const fetchPendingItems = async () => {
            const [projects, tasks, tickets] = await Promise.all([
                getProjects(),
                getImmediateTasks(),
                getTickets()
            ]);

            const pendingProjects = projects.filter(p => p.team.includes(currentUser.id) && (p.status === 'On Track' || p.status === 'On Hold')).length;
            const pendingTasks = tasks.filter(t => t.userId === currentUser.id && t.status === 'pending').length;
            const pendingTickets = tickets.filter(t => t.assigneeId === currentUser.id && (t.status === 'Open' || t.status === 'In Progress')).length;

            const summaryParts: string[] = [];
            if (pendingProjects > 0) summaryParts.push(`${pendingProjects} ${pendingProjects === 1 ? 'proyecto' : 'proyectos'}`);
            if (pendingTasks > 0) summaryParts.push(`${pendingTasks} ${pendingTasks === 1 ? 'tarea' : 'tareas'}`);
            if (pendingTickets > 0) summaryParts.push(`${pendingTickets} ${pendingTickets === 1 ? 'ticket' : 'tickets'}`);

            if (summaryParts.length > 0) {
                setPendingSummary(`Además, tienes ${summaryParts.join(', ')} pendientes.`);
            } else {
                setPendingSummary("No tienes asuntos pendientes. ¡Buen trabajo!");
            }
        };

        fetchPendingItems();
        const summaryInterval = setInterval(fetchPendingItems, 15000); // Update every 15 seconds

        return () => clearInterval(summaryInterval);

    }, [currentUser]);

    if (!currentUser) return null;

    return (
        <div className="hidden lg:flex flex-col items-start text-sm text-primary-foreground/90">
            <p className="text-base">
                {greeting}, <strong>{currentUser.name}</strong>. {dateTime}.
            </p>
            <p className="font-semibold text-primary-foreground">{pendingSummary}</p>
        </div>
    )
}

export function Header() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);


  useEffect(() => {
    async function fetchData() {
        if (!currentUser) return;
        
        const allNotifs = await getNotifications();

        const userNotifs = allNotifs.filter(n => !n.userId || n.userId === currentUser.id);

        setNotifications(userNotifs);
        setHasUnread(userNotifs.some(n => !n.read));
    }
    fetchData();
    
    const interval = setInterval(fetchData, 5000); // Poll for new notifications
    return () => clearInterval(interval);

  }, [currentUser]);

  useEffect(() => {
    const performSearch = async () => {
        if (debouncedSearchQuery.length > 1) {
            setIsSearching(true);
            const results = await searchGlobal(debouncedSearchQuery);
            setSearchResults(results);
            setIsSearching(false);
        } else {
            setSearchResults([]);
        }
    };
    performSearch();
  }, [debouncedSearchQuery]);

   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationsOpen = async (open: boolean) => {
    if (open && hasUnread) {
        await markNotificationsAsRead();
        setHasUnread(false);
        setNotifications(notifications.map(n => ({...n, read: true})));
    }
  }
  
  const handleLogout = () => {
    localStorage.removeItem('loggedInUserId');
    router.push('/login');
    router.refresh();
  };

  const showSearchResults = isSearchFocused && (searchResults.length > 0 || isSearching || searchQuery.length > 1);
  
  return (
    <>
    <header className="flex h-20 items-center justify-between gap-4 bg-primary px-4 md:px-6 sticky top-0 z-30 text-primary-foreground">
      <div className="flex items-center gap-4">
        <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
        >
            <Logo color="white" className="w-48" />
        </Link>
        <span className="h-8 w-[1px] bg-primary-foreground/30 hidden lg:block"></span>
        <ClientOnly>
          <DynamicGreeting />
        </ClientOnly>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        
        <Button variant="ghost" size="icon" className="rounded-full relative text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => setIsClockModalOpen(true)}>
            <Clock className="h-5 w-5" />
            <span className="sr-only">Registro de Horas</span>
        </Button>

        <DropdownMenu onOpenChange={handleNotificationsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <ClientOnly>
                      {hasUnread && <span className="absolute -top-0 -right-0 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span><span className="relative inline-flex items-center justify-center text-xs rounded-full h-4 w-4 bg-destructive"></span></span>}
                    </ClientOnly>
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Ver notificaciones</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-96">
                    {notifications.length > 0 ? notifications.map(notif => (
                        <DropdownMenuItem key={notif.id} asChild>
                           <Link href={notif.link} className="flex flex-col items-start gap-1 whitespace-normal">
                                <p className="text-sm">{notif.message}</p>
                                <p className="text-xs text-muted-foreground">
                                    <ClientOnly>
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: es })}
                                    </ClientOnly>
                                </p>
                           </Link>
                        </DropdownMenuItem>
                    )) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No tienes notificaciones.
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <Button variant="ghost" className="rounded-full p-0 h-auto flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              {currentUser && (
                <>
                <Avatar className="h-7 w-7">
                    <AvatarImage src={currentUser.profilePicture || getAvatarUrl(currentUser.avatar, currentUser.name)} alt={currentUser.name} />
                    <AvatarFallback>
                        {getInitials(currentUser.name)}
                    </AvatarFallback>
                </Avatar>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {currentUser && <DropdownMenuItem asChild><Link href={`/users/${currentUser.id}`}>Mi Perfil</Link></DropdownMenuItem>}
            <DropdownMenuItem asChild><Link href="/settings">Configuración</Link></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setIsSupportModalOpen(true)}>Soporte</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    {isSupportModalOpen && <SupportTicketModal onOpenChange={setIsSupportModalOpen} />}
    {isClockModalOpen && <ClockModal isOpen={isClockModalOpen} onClose={() => setIsClockModalOpen(false)} />}
    </>
  );
}
