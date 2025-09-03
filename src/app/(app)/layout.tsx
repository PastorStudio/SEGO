

'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Settings, Users, FileText, CheckSquare, Sparkles, Receipt, AlertTriangle, UserRound, Warehouse, Truck, MessageCircle, LayoutGrid, BarChart3, Calendar, Ticket, Search, PartyPopper, ClipboardList, ShieldCheck } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarFooter,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarInput,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Header } from "@/components/layout/header"
import { type Page, type User, type Notification } from "@/lib/definitions"
import { getUnreadMessageCount, getNotifications } from "@/lib/data"
import { AuthProvider, useAuth } from "@/hooks/use-auth.tsx"
import { cn } from "@/lib/utils"
import { ClientOnly } from "@/components/client-only"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState, useRef, useCallback } from "react"
import { FloatingActionMenu } from "@/components/layout/floating-action-menu"
import { useToast } from "@/hooks/use-toast"
import { getAvatarUrl } from "@/lib/avatars"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ConfettiCannon } from "@/components/ui/confetti-cannon"


const mainNavLinks: Omit<LinkType, 'icon'>[] = [
  { href: "/dashboard", label: "Dashboard", pageName: "Dashboard" as Page },
  { href: "/analytics", label: "Análisis", pageName: "Analytics" as Page },
  { href: "/human-resources", label: "Recursos Humanos", pageName: "Recursos Humanos" as Page },
  { href: "/admin-supervision", label: "Admin & Supervisión", pageName: "Administración y Supervisión" as Page },
  { href: "/immediate-work", label: "Trabajo Inmediato", pageName: "Trabajo inmediato" as Page },
  { href: "/tickets", label: "Tickets", pageName: "Tickets" as Page },
  { href: "/projects", label: "Proyectos", pageName: "Projects" as Page },
  { href: "/tasks", label: "Tareas", pageName: "Tasks" as Page },
  { href: "/chat", label: "Chat", pageName: "Chat" as Page },
  { href: "/invoices", label: "Facturas", pageName: "Invoices" as Page },
  { href: "/clients", label: "Clientes", pageName: "Clients" as Page },
  { href: "/services", label: "Servicios", pageName: "Services" as Page },
  { href: "/warehouse", label: "Almacén", pageName: "Warehouse" as Page },
  { href: "/montaje", label: "Montaje", pageName: "Montaje" as Page },
  { href: "/delivery-routes", label: "Reparto", pageName: "Reparto" as Page },
  { href: "/accounts-receivable", label: "Cuentas por Cobrar", pageName: "Cuentas por Cobrar" as Page },
  { href: "/our-parties", label: "Nuestras Fiestas", pageName: "Nuestras Fiestas" as Page },
]

const footerLinks: Omit<LinkType, 'icon'>[] = [
    { href: "/users", label: "Usuarios & Compañías", pageName: "Users & Companies" as Page },
    { href: "/settings", label: "Configuración", pageName: "Settings" as Page }
];

const icons: Record<Page, React.ElementType> = {
  "Dashboard": Home,
  "Analytics": BarChart3,
  "Recursos Humanos": ClipboardList,
  "Administración y Supervisión": ShieldCheck,
  "Trabajo inmediato": AlertTriangle,
  "Projects": Sparkles,
  "Tasks": CheckSquare,
  "Chat": MessageCircle,
  "Invoices": FileText,
  "Clients": UserRound,
  "Services": Sparkles,
  "Warehouse": Warehouse,
  "Montaje": LayoutGrid,
  "Reparto": Truck,
  "Cuentas por Cobrar": Receipt,
  "Nuestras Fiestas": PartyPopper,
  "Users & Companies": Users,
  "Settings": Settings,
  "Tickets": Ticket,
};

type LinkType = {
    href: string;
    label: string;
    icon: React.ElementType;
    pageName: Page;
};


const allLinks: LinkType[] = [
    ...mainNavLinks.map(link => ({ ...link, icon: icons[link.pageName] })),
    ...footerLinks.map(link => ({ ...link, icon: icons[link.pageName] }))
];

function LoadingSkeleton() {
    return (
        <div className="flex h-screen w-full flex-col">
             <div className="flex h-14 items-center justify-between gap-4 border-b bg-primary px-4 md:px-6 text-primary-foreground sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 bg-primary-foreground/20" />
                    <Skeleton className="h-6 w-24 bg-primary-foreground/20" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full bg-primary-foreground/20" />
                </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
                <div className="hidden sm:flex flex-col gap-4 border-r w-[230px] h-full bg-sidebar p-2">
                     <div className="flex items-center gap-4 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                     </div>
                     <div className="px-2">
                        <Skeleton className="h-9 w-full" />
                     </div>
                     <div className="flex flex-col gap-2 mt-2 p-2">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-8 w-full" />
                        ))}
                    </div>
                </div>
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-background">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-1/4" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </main>
            </div>
        </div>
    )
}

const POLLING_INTERVAL = 5000; // 5 seconds

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}

function BirthdayModal({ user, onOpenChange }: { user: User, onOpenChange: (open: boolean) => void }) {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 8000); // stop confetti after 8 seconds
        return () => clearTimeout(timer);
    }, []);

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <ConfettiCannon active={showConfetti} />
            <DialogContent className="sm:max-w-md">
                 <DialogHeader className="flex flex-col items-center justify-center text-center p-4">
                    <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
                         <PartyPopper className="h-16 w-16 text-primary animate-bounce" />
                    </div>
                    <DialogTitle className="text-3xl font-bold">¡Feliz Cumpleaños, {user.name}!</DialogTitle>
                    <DialogDescription className="text-lg text-muted-foreground mt-2 text-center">
                       De parte de todo el equipo de SEGO Eventos, te deseamos un día increíble y lleno de alegría.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter();
  const { visibleLinks, currentUser, isLoading, users, clients } = useAuth();
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const { toast } = useToast();
  const lastNotificationTimestamp = useRef<string>(new Date().toISOString());
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const hasShownBirthday = useRef(false);
  
  useEffect(() => {
    if (!isLoading && currentUser && visibleLinks.length > 0) {
      const isAllowed = visibleLinks.some(link => pathname.startsWith(link.href));
      const isRootPath = pathname === '/';
      const isOwnProfile = pathname.startsWith(`/users/${currentUser.id}`);
      
      if (!isAllowed && !isRootPath && !isOwnProfile && pathname !== '/human-resources' && pathname !== '/admin-supervision') {
        const fallbackUrl = visibleLinks[0]?.href || '/immediate-work';
        router.push(fallbackUrl);
        return;
      }
    }
  }, [pathname, isLoading, currentUser, visibleLinks, router]);

   useEffect(() => {
    if (!currentUser) return;
    const fetchCounts = async () => {
        const counts = await getUnreadMessageCount(currentUser.id);
        const total = Object.values(counts).reduce((acc, count) => acc + count, 0);
        setUnreadChatCount(total);
    }
    fetchCounts();
    const interval = setInterval(fetchCounts, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [currentUser, pathname]);

  useEffect(() => {
    if (!currentUser) return;
    
    const pollNotifications = async () => {
        const allNotifs = await getNotifications();
        const userNotifs = allNotifs.filter(n => (!n.userId || n.userId === currentUser.id));

        const newNotifs = userNotifs.filter(n => new Date(n.createdAt) > new Date(lastNotificationTimestamp.current));

        if (newNotifs.length > 0) {
            newNotifs.forEach(notif => {
                toast({
                    title: "Nueva Notificación",
                    description: notif.message,
                    action: (
                       <Link href={notif.link} className="block w-full text-right">Ver</Link>
                    )
                });
            });
            lastNotificationTimestamp.current = newNotifs.reduce((latest, current) => 
                new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
            ).createdAt;
        }
    }

    const interval = setInterval(pollNotifications, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [currentUser, toast]);

  useEffect(() => {
    if (currentUser && !hasShownBirthday.current) {
        const today = new Date();
        const birthDateStr = currentUser.birthDate;

        if (birthDateStr) {
            // Adjust for UTC by splitting the date string
            const [year, month, day] = birthDateStr.split('-').map(Number);
            const userBirthDate = new Date(Date.UTC(year, month - 1, day));
            
            if (today.getUTCMonth() === userBirthDate.getUTCMonth() && today.getUTCDate() === userBirthDate.getUTCDate()) {
                setIsBirthdayModalOpen(true);
                hasShownBirthday.current = true;
            }
        }
    }
}, [currentUser]);



  if (isLoading || !currentUser) {
    return <LoadingSkeleton />;
  }

  const isLinkVisible = (pageName: Page) => visibleLinks.some(link => link.pageName === pageName);

  const visibleMainLinks = mainNavLinks.filter(link => isLinkVisible(link.pageName));
  const visibleFooterLinks = footerLinks.filter(link => isLinkVisible(link.pageName));

  return (
    <SidebarProvider>
        <div className="flex flex-col h-screen w-full">
            {isBirthdayModalOpen && currentUser && <BirthdayModal user={currentUser} onOpenChange={setIsBirthdayModalOpen} />}
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar>
                     <SidebarContent>
                        <SidebarMenu>
                            <li className="px-2 py-1.5 text-xs font-semibold text-sidebar-foreground/50">MAIN NAVIGATION</li>
                        {visibleMainLinks.map((link) => {
                            const Icon = icons[link.pageName];
                            const isChat = link.pageName === 'Chat';
                            return (
                            <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton
                                asChild
                                isActive={pathname.startsWith(link.href)}
                                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent"
                                >
                                <Link href={link.href}>
                                    <Icon />
                                    <span>{link.label}</span>
                                    {isChat && (
                                        <ClientOnly>
                                        {unreadChatCount > 0 && <SidebarMenuBadge>{unreadChatCount}</SidebarMenuBadge>}
                                        </ClientOnly>
                                    )}
                                </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            )
                        })}
                        </SidebarMenu>
                        
                        {visibleFooterLinks.length > 0 && (
                        <SidebarFooter>
                            <SidebarMenu>
                                {visibleFooterLinks.map(link => {
                                    const Icon = icons[link.pageName];
                                    return (
                                    <SidebarMenuItem key={link.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname.startsWith(link.href)}
                                             className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent"
                                            >
                                            <Link href={link.href}>
                                                <Icon />
                                                <span>{link.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarFooter>
                        )}

                    </SidebarContent>
                </Sidebar>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
                    {children}
                </main>
            </div>
             <FloatingActionMenu users={users} clients={clients} />
        </div>
    </SidebarProvider>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider allLinks={allLinks}>
        <ClientOnly fallback={<LoadingSkeleton />}>
            <AppLayoutContent>{children}</AppLayoutContent>
        </ClientOnly>
    </AuthProvider>
  )
}
