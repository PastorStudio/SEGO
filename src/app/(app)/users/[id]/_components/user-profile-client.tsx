
'use client'

import { type User, type Project, type ImmediateTask } from "@/lib/definitions"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MessageCircle, Briefcase, Check, Sparkles, Edit, Cake, UserRound, CalendarDays, FileArchive } from "lucide-react"
import { ClientOnly, ClientDate } from "@/components/client-only"
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from "next/link"
import { AvatarSelector } from "@/app/(app)/settings/_components/avatar-selector"
import { useAuth } from "@/hooks/use-auth.tsx"
import { useRouter } from "next/navigation"
import { getAvatarUrl } from "@/lib/avatars"

const getInitials = (name: string) => {
    if (!name) return ''
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}

const roleVariant: { [key in User['role']]: "default" | "secondary" | "destructive" | "outline" } = {
  "Super-Admin": "destructive",
  "Admin": "destructive",
  "Agent": "outline",
  "Viewer": "secondary"
}

const workStatusVariant: { [key in NonNullable<User['workStatus']>]: "default" | "secondary" | "destructive" | "outline" } = {
  "Activo": "default",
  "En Pausa": "outline",
  "De Baja": "destructive"
}


type UserProfileClientProps = {
    user: User;
    projects: Project[];
    tasks: ImmediateTask[];
};

export function UserProfileClient({ user, projects, tasks }: UserProfileClientProps) {
    const { currentUser } = useAuth();
    const router = useRouter();
    const isOwnProfile = currentUser?.id === user.id;

    const formatLastSeen = (dateString: string) => {
        const date = new Date(dateString);
        return formatDistanceToNow(date, { addSuffix: true, locale: es });
    }

    const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
    const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;

    const whatsAppMessage = `Hola como estas, ${user.name}?, necesito hablar contigo por favor llamame, lo antes posible, gracias.`;
    const encodedMessage = encodeURIComponent(whatsAppMessage);
    const cleanPhoneNumber = user.phone?.replace(/\D/g, '') || '';
    
    const handleSendMessage = () => {
        router.push(`/chat?user=${user.id}`);
    }
    
    return (
        <>
            <PageHeader title="Perfil de Empleado" >
                {isOwnProfile && (
                     <Button asChild>
                        <Link href={`/users/${user.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Perfil
                        </Link>
                    </Button>
                )}
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Left Column - Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                             <ClientOnly>
                            {isOwnProfile ? (
                                <AvatarSelector />
                            ) : (
                                <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                                    <AvatarImage src={user.profilePicture || getAvatarUrl(user.avatar, user.name)} alt={user.name} />
                                    <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                            )}
                            </ClientOnly>

                            <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
                             {user.workStatus && <Badge variant={workStatusVariant[user.workStatus]} className="mt-1">{user.workStatus}</Badge>}
                            
                            <p className="text-sm text-muted-foreground mt-2">
                                <ClientOnly>
                                     {user.status === 'online' ? (
                                        <span className="flex items-center justify-center gap-2 text-green-500"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>En línea</span>
                                     ) : (
                                        `Visto por última vez ${formatLastSeen(user.lastSeen)}`
                                     )}
                                </ClientOnly>
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Información del Empleado</CardTitle></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                             <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-muted-foreground" /><span>{user.email}</span></div>
                             <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><span>{user.phone}</span></div>
                             {user.position && <div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-muted-foreground" /><span>{user.position}</span></div>}
                             {user.hireDate && <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-muted-foreground" /><span>Contratado: <ClientDate value={user.hireDate} options={{ timeZone: 'UTC' }} /></span></div>}
                             {user.birthDate && <div className="flex items-center gap-3"><Cake className="h-5 w-5 text-muted-foreground" /><span>Cumpleaños: <ClientDate value={user.birthDate} options={{ year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }}/></span></div>}
                            
                            <div className="flex flex-col gap-2 pt-2">
                                <Button className="w-full" onClick={handleSendMessage} variant="outline"><MessageCircle className="h-5 w-5 mr-2" /> Chat Interno</Button>
                                <Button className="w-full" asChild><a href={`https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`} target="_blank" rel="noopener noreferrer"><svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 fill-current"><title>WhatsApp</title><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52s-.67-.816-.916-1.103c-.247-.287-.5-.347-.697-.352-.198-.005-.42-.005-.644-.005-.224 0-.57.075-.872.372-.302.297-1.153 1.127-1.153 2.746 0 1.62.981 3.186 1.105 3.407.124.22 2.21 3.352 5.353 4.729.754.346 1.344.552 1.799.702.712.237 1.36.198 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.204-1.634a11.86 11.86 0 005.785 1.47h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>WhatsApp</a></Button>
                           </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Activity */}
                <div className="lg:col-span-2 space-y-6">
                     <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Proyectos</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{projects.length}</div></CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{pendingTasksCount}</div></CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tareas Completadas</CardTitle><Check className="h-4 w-4 text-muted-foreground" /></CardHeader>
                            <CardContent><div className="text-2xl font-bold">{completedTasksCount}</div></CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Actividad Reciente</CardTitle><CardDescription>Proyectos y tareas asignadas a {user.name}.</CardDescription></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-primary" />Proyectos Asignados</h3>
                                {projects.length > 0 ? (<ul className="space-y-2">{projects.slice(0, 5).map(p => (<li key={p.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-secondary"><Link href={`/projects/${p.id}`} className="font-medium hover:underline">{p.name}</Link><Badge variant="outline">{p.status}</Badge></li>))}</ul>) : (<p className="text-sm text-muted-foreground">No hay proyectos asignados.</p>)}
                            </div>
                            <div>
                                <h3 className="font-semibold flex items-center gap-2 mb-2"><Check className="h-5 w-5 text-green-500" />Tareas Inmediatas Completadas</h3>
                                 {tasks.filter(t => t.status === 'completed').length > 0 ? (<ul className="space-y-2">{tasks.filter(t => t.status === 'completed').slice(0, 5).map(t => (<li key={t.id} className="text-sm text-muted-foreground line-through p-2 rounded-md bg-secondary/50">{t.title}</li>))}</ul>) : (<p className="text-sm text-muted-foreground">No hay tareas completadas recientemente.</p>)}
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader><CardTitle>Gestión de Documentos</CardTitle></CardHeader>
                         <CardContent>
                           <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                                <FileArchive className="h-12 w-12 mb-4" />
                                <h3 className="font-semibold">Próximamente</h3>
                                <p className="text-sm">Esta sección permitirá subir y gestionar documentos del empleado como contratos, identificaciones y certificados.</p>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
