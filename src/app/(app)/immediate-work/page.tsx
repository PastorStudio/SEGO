
'use client'

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { getUsers, getImmediateTasks, getProjects, addImmediateTask, deleteImmediateTask, updateImmediateTaskStatus, getProject, linkImmediateTaskToProject, addCommentToImmediateTask } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { PlusCircle, X, Check, ClipboardList, Info, Link2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth.tsx";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Project, User, ImmediateTask } from "@/lib/definitions";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ConfettiCannon } from "@/components/ui/confetti-cannon";
import { CommentSection } from "../warehouse/_components/comment-section";
import { getAvatarUrl } from "@/lib/avatars";

const POLLING_INTERVAL = 2000; // 2 seconds

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}

export default function ImmediateWorkPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [immediateTasks, setImmediateTasks] = useState<ImmediateTask[]>([]);
  const { currentUser } = useAuth();
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<ImmediateTask | null>(null);
  const [selectedTaskProject, setSelectedTaskProject] = useState<Project | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const [selectedUserForNewTask, setSelectedUserForNewTask] = useState<User | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [usersData, tasksData, projectsData] = await Promise.all([
        getUsers(),
        getImmediateTasks(),
        getProjects(),
      ]);

      setProjects(projectsData);
      
      const sortedUsers = [...usersData].sort((a, b) => {
          if(currentUser) {
            if (a.id === currentUser.id) return -1;
            if (b.id === currentUser.id) return 1;
          }
          return a.name.localeCompare(b.name);
      });
      setUsers(sortedUsers);
      
      setImmediateTasks(tasksData);
      setIsLoading(false);
    }
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    // Poll for new tasks every few seconds
    const intervalId = setInterval(async () => {
        const tasksData = await getImmediateTasks();
        setImmediateTasks(tasksData);
    }, POLLING_INTERVAL);

    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);
 
  const canDelete = currentUser?.role === 'Super-Admin' || currentUser?.role === 'Admin';
  const canAddTask = currentUser?.role === 'Super-Admin' || currentUser?.role === 'Admin';
  const canViewAllDetails = currentUser?.role === 'Super-Admin' || currentUser?.role === 'Admin';
  const canViewAllUsers = currentUser?.role === 'Super-Admin' || currentUser?.role === 'Admin';

  const getTasksForUser = (userId: string, status: 'pending' | 'completed') => {
    return immediateTasks.filter(task => task.userId === userId && task.status === status)
  }
  
  const getTaskCountForUser = (userId: string, status: 'pending' | 'completed') => {
    return immediateTasks.filter(task => task.userId === userId && task.status === status).length;
  }

  const handleDeleteTask = async (taskId: string) => {
    const originalTasks = [...immediateTasks];
    setImmediateTasks(currentTasks => currentTasks.filter(task => task.id !== taskId));
    
    try {
        await deleteImmediateTask(taskId);
        toast({ title: "Tarea Eliminada", description: "La tarea ha sido eliminada."});
    } catch(e) {
        setImmediateTasks(originalTasks);
        toast({ title: "Error", description: "No se pudo eliminar la tarea.", variant: "destructive"});
    }
  };

  const handleMarkAsCompleted = async (taskId: string) => {
    const originalTasks = [...immediateTasks];
    setImmediateTasks(currentTasks => currentTasks.map(task => task.id === taskId ? {...task, status: 'completed'} : task));
    
    setShowConfetti(true);

    setTimeout(() => {
        setIsDetailsDialogOpen(false);
        setShowConfetti(false);
    }, 5000); // Stop confetti and close modal after 5 seconds

    try {
        await updateImmediateTaskStatus(taskId, 'completed');
        toast({ title: "Tarea Completada", description: "¡Buen trabajo!"});
    } catch(e) {
        setImmediateTasks(originalTasks);
        setShowConfetti(false);
        setIsDetailsDialogOpen(true);
        toast({ title: "Error", description: "No se pudo actualizar la tarea.", variant: "destructive"});
    }
  };
  
  const handleOpenNewTaskDialog = (user: User) => {
    setSelectedUserForNewTask(user);
    setNewTaskTitle("");
    setNewTaskNotes("");
    setIsNewTaskDialogOpen(true);
  }

  const handleOpenDetailsDialog = async (task: ImmediateTask) => {
    setSelectedTaskForDetails(task);
    if(task.projectId) {
        const project = await getProject(task.projectId);
        setSelectedTaskProject(project || null);
    } else {
        setSelectedTaskProject(null);
    }
    setIsDetailsDialogOpen(true);
  }

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedUserForNewTask || !currentUser) {
        toast({ title: "Error", description: "Faltan datos para crear la tarea.", variant: "destructive"});
        return;
    }
    
    try {
        const addedTask = await addImmediateTask({
            title: newTaskTitle,
            userId: selectedUserForNewTask.id,
            status: 'pending',
            notes: newTaskNotes
        }, currentUser.name);

        setImmediateTasks(prevTasks => [...prevTasks, addedTask]);
        
        toast({ title: "Tarea Creada", description: `Se ha asignado una nueva tarea a ${selectedUserForNewTask.name}.`});
        
        setNewTaskTitle("");
        setNewTaskNotes("");
        setIsNewTaskDialogOpen(false);

    } catch(e) {
        toast({ title: "Error", description: "No se pudo crear la tarea.", variant: "destructive"});
    }
  }

   const handleLinkProject = async (taskId: string, projectId: string) => {
    if(!projectId) return;

    const originalTasks = [...immediateTasks];
    setImmediateTasks(currentTasks => currentTasks.map(task => 
      task.id === taskId ? { ...task, projectId } : task
    ));
    setSelectedTaskForDetails(prev => prev ? {...prev, projectId} : null);
    const project = await getProject(projectId);
    setSelectedTaskProject(project || null);
    
    try {
      await linkImmediateTaskToProject(taskId, projectId);
      toast({ title: "Tarea Vinculada", description: "La tarea ha sido vinculada al proyecto." });
    } catch(e) {
      setImmediateTasks(originalTasks);
      toast({ title: "Error", description: "No se pudo vincular la tarea.", variant: "destructive" });
    }
  };

  const displayedUsers = canViewAllUsers ? users : users.filter(u => u.id === currentUser?.id);
  
  if (isLoading) {
    return (
        <>
            <PageHeader title="Trabajo Inmediato" />
            <div className="space-y-8">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-muted"></div>
                            <div className="h-6 w-32 rounded-md bg-muted"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-48 rounded-md bg-muted"></div>
                            <div className="h-48 rounded-md bg-muted"></div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
  }

  return (
    <>
      <ConfettiCannon active={showConfetti} />
      <PageHeader title="Trabajo Inmediato" description="Tareas urgentes para el equipo. Prioriza y completa."/>
      <div className="space-y-10">
        {displayedUsers.map((user) => {
            const isCurrentUser = user.id === currentUser?.id;
            const showDetails = canViewAllDetails || isCurrentUser;

            return (
                <div key={user.id} className={cn(isCurrentUser && "p-6 rounded-xl border-2 border-primary/50 bg-primary/5 shadow-lg")}>
                    <div className="flex items-center gap-4 mb-4">
                         <Avatar className={cn("h-12 w-12", isCurrentUser && "h-16 w-16")}>
                            <AvatarImage src={getAvatarUrl(user.avatar, user.name)} alt={user.name} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className={cn("text-2xl font-bold", isCurrentUser && "text-3xl")}>{user.name}</h2>
                             {canAddTask && (
                                <Button variant="outline" size="sm" onClick={() => handleOpenNewTaskDialog(user)} className={cn(!isCurrentUser && "mt-1")}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Agregar Tarea
                                </Button>
                             )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pending Column */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-center text-yellow-800 dark:text-yellow-300">Pendientes</h3>
                            <Card className="bg-yellow-50 dark:bg-yellow-900/20 min-h-[200px]">
                                <CardContent className="p-4 space-y-3">
                                   {showDetails ? (
                                     getTasksForUser(user.id, 'pending').map(task => (
                                       <Card 
                                            key={task.id} 
                                            className="p-3 shadow-sm bg-white dark:bg-card relative group cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => handleOpenDetailsDialog(task)}
                                        >
                                          <p className="text-sm pr-6">{task.title}</p>
                                           {canDelete && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                              onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                            >
                                              <X className="h-4 w-4" />
                                              <span className="sr-only">Eliminar tarea</span>
                                            </Button>
                                          )}
                                       </Card>
                                     ))
                                   ) : (
                                        <div className="flex flex-col items-center justify-center h-full pt-10 text-yellow-900 dark:text-yellow-200">
                                            <ClipboardList className="h-10 w-10" />
                                            <p className="text-2xl font-bold mt-2">{getTaskCountForUser(user.id, 'pending')}</p>
                                            <p className="text-sm">Tareas Pendientes</p>
                                        </div>
                                   )}
                                   {showDetails && getTasksForUser(user.id, 'pending').length === 0 && (
                                    <div className="flex items-center justify-center h-full pt-10">
                                        <p className="text-sm text-muted-foreground">No hay tareas pendientes.</p>
                                    </div>
                                   )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Completed Column */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-center text-green-800 dark:text-green-300">Completadas</h3>
                            <Card className="bg-green-50 dark:bg-green-900/20 min-h-[200px]">
                                <CardContent className="p-4 space-y-3">
                                   {showDetails ? (
                                     getTasksForUser(user.id, 'completed').map(task => (
                                       <Card key={task.id} className="p-3 shadow-sm bg-white dark:bg-card relative group">
                                          <p className="text-sm line-through text-muted-foreground pr-6">{task.title}</p>
                                           {canDelete && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                              onClick={() => handleDeleteTask(task.id)}
                                            >
                                              <X className="h-4 w-4" />
                                              <span className="sr-only">Eliminar tarea</span>
                                            </Button>
                                          )}
                                       </Card>
                                     ))
                                    ) : (
                                         <div className="flex flex-col items-center justify-center h-full pt-10 text-green-900 dark:text-green-200">
                                            <Check className="h-10 w-10" />
                                            <p className="text-2xl font-bold mt-2">{getTaskCountForUser(user.id, 'completed')}</p>
                                            <p className="text-sm">Tareas Completadas</p>
                                        </div>
                                    )}
                                    {showDetails && getTasksForUser(user.id, 'completed').length === 0 && (
                                        <div className="flex items-center justify-center h-full pt-10">
                                            <p className="text-sm text-muted-foreground">No hay tareas completadas.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )
        })}
      </div>
      {/* Dialog for New Task */}
      <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Agregar Nueva Tarea</DialogTitle>
                <DialogDescription>
                    Agrega una nueva tarea para {selectedUserForNewTask?.name}. Haz clic en guardar cuando termines.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="task-title">Título</Label>
                    <Input
                        id="task-title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Ej: Llamar al cliente para confirmar"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="task-notes">Notas (Opcional)</Label>
                    <Textarea
                        id="task-notes"
                        value={newTaskNotes}
                        onChange={(e) => setNewTaskNotes(e.target.value)}
                        placeholder="Añadir detalles o instrucciones aquí..."
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsNewTaskDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>Guardar Tarea</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Dialog for Task Details */}
      {selectedTaskForDetails && (
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalle de la Tarea</DialogTitle>
                    <DialogDescription>
                        {selectedTaskForDetails.title}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold">Notas</h4>
                        {selectedTaskForDetails.notes ? (
                            <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-md mt-1">{selectedTaskForDetails.notes}</p>
                        ) : (
                            <p className="text-sm text-muted-foreground mt-1">No hay notas para esta tarea.</p>
                        )}
                    </div>
                    <Separator />
                    <div>
                        <h4 className="text-sm font-semibold mb-2">Proyecto</h4>
                        {selectedTaskProject ? (
                            <p className="text-sm text-muted-foreground">
                                <strong>Proyecto:</strong> {selectedTaskProject.name}
                            </p>
                        ) : (
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Esta tarea no está asociada a un proyecto.
                                </p>
                                <div className="flex gap-2 items-center">
                                    <Select onValueChange={(projectId) => handleLinkProject(selectedTaskForDetails!.id, projectId)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Vincular a un proyecto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {projects.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>
                    <Separator />
                    <CommentSection
                        entityId={selectedTaskForDetails.id}
                        comments={selectedTaskForDetails.comments || []}
                        currentUser={currentUser}
                        users={users}
                        addCommentAction={addCommentToImmediateTask}
                    />
                </div>
                <DialogFooter>
                        <Button variant="secondary" onClick={() => setIsDetailsDialogOpen(false)}>Cerrar</Button>
                        {selectedTaskForDetails.status === 'pending' && (
                            <Button onClick={() => handleMarkAsCompleted(selectedTaskForDetails.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Marcar como Completada
                            </Button>
                        )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </>
  )
}
