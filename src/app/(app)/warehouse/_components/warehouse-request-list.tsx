

'use client'

import { updateWarehouseRequest, addCommentToWarehouseRequest } from "@/lib/data";
import type { WarehouseRequest, Project, User } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CommentSection } from "./comment-section";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth.tsx";
import { ClientDate } from "@/components/client-only";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const statusVariant: { [key in WarehouseRequest['status']]: "default" | "secondary" | "destructive" } = {
  "Pending": "destructive",
  "In Progress": "default",
  "Completed": "secondary",
};

const statusTranslate: { [key in WarehouseRequest['status']]: string } = {
  "Pending": "Pendiente",
  "In Progress": "En Proceso",
  "Completed": "Completado",
};

const statusRowColorVariant: { [key in WarehouseRequest['status']]?: string } = {
  "Pending": "bg-red-500/10 hover:bg-red-500/20",
  "In Progress": "bg-yellow-500/10 hover:bg-yellow-500/20",
  "Completed": "bg-green-500/10 hover:bg-green-500/20",
};


type WarehouseRequestListProps = {
    initialRequests: WarehouseRequest[];
    initialProjects: Project[];
    initialUsers: User[];
}

export function WarehouseRequestList({ initialRequests, initialProjects, initialUsers }: WarehouseRequestListProps) {
  const [requests, setRequests] = useState<WarehouseRequest[]>(initialRequests);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [passwordInput, setPasswordInput] = useState("");

  const [statusChangeState, setStatusChangeState] = useState<{
    isOpen: boolean;
    requestId: string | null;
    newStatus: WarehouseRequest['status'] | null;
  }>({ isOpen: false, requestId: null, newStatus: null });

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || "N/A";
  };
  
  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || "Desconocido";
  }
  
  const handleOpenStatusChangeDialog = (requestId: string, newStatus: WarehouseRequest['status']) => {
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Super-Admin')) {
        toast({ title: "Acción no permitida", description: "No tienes permisos para cambiar el estado.", variant: 'destructive'});
        return;
    }
    setStatusChangeState({ isOpen: true, requestId, newStatus });
    setPasswordInput("");
  }
  
  const confirmStatusChange = async () => {
    if (!currentUser || !currentUser.password || !statusChangeState.requestId || !statusChangeState.newStatus) {
       toast({ title: "Error", description: "No se pudo verificar el usuario o la solicitud.", variant: 'destructive' });
       return;
    }
    
    if (passwordInput !== currentUser.password) {
      toast({ title: "Contraseña Incorrecta", description: "La contraseña ingresada no es correcta.", variant: "destructive" });
      return;
    }

    const { requestId, newStatus } = statusChangeState;

    const originalRequests = [...requests];
    const updatedRequests = requests.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
    
    try {
      await updateWarehouseRequest(requestId, newStatus, currentUser.name);
       toast({
        title: "Estado Actualizado",
        description: `El estado de la solicitud ${requestId} ha sido actualizado.`,
      })
    } catch (error) {
      setRequests(originalRequests);
       toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la solicitud.",
        variant: 'destructive',
      })
    } finally {
        setStatusChangeState({ isOpen: false, requestId: null, newStatus: null });
    }
  }


  return (
    <>
    <Card>
        <CardHeader>
            <CardTitle>Solicitudes Pendientes y en Proceso</CardTitle>
            <CardDescription>
                Revisa las solicitudes, actualiza su estado y consulta los artículos requeridos para cada evento.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full space-y-4">
             {requests.length > 0 ? requests.map((request) => (
              <AccordionItem value={request.id} key={request.id} className={cn("border rounded-md px-4", statusRowColorVariant[request.status] ?? 'bg-secondary/50')}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex justify-between items-center w-full">
                     <div className="flex items-center gap-4 text-left">
                        <div className="font-medium text-primary">{request.id}</div>
                        <div className="hidden sm:block">
                            <div className="font-medium">{getProjectName(request.projectId)}</div>
                            <div className="text-sm text-muted-foreground">Solicitado por: <strong>{getUserName(request.requesterId)}</strong></div>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 pr-4" onClick={(e) => e.stopPropagation()}>
                        <Select value={request.status} onValueChange={(newStatus: WarehouseRequest['status']) => handleOpenStatusChangeDialog(request.id, newStatus)}>
                             <SelectTrigger className="w-[180px] hidden md:flex">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pendiente</SelectItem>
                                <SelectItem value="In Progress">En Proceso</SelectItem>
                                <SelectItem value="Completed">Completado</SelectItem>
                            </SelectContent>
                        </Select>
                        <Badge variant={statusVariant[request.status]} className={cn(
                            request.status === 'Pending' && 'bg-red-500/80 text-white hover:bg-red-500',
                            request.status === 'In Progress' && 'bg-yellow-500/80 text-black hover:bg-yellow-500',
                            request.status === 'Completed' && 'bg-green-500/80 text-white hover:bg-green-500',
                            "block md:hidden"
                        )}>
                            {statusTranslate[request.status]}
                        </Badge>
                        <span className="text-sm text-muted-foreground hidden lg:block">
                            {request.items.length} {request.items.length === 1 ? 'artículo' : 'artículos'}
                        </span>
                     </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                    <div className="p-4 bg-background rounded-md border space-y-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Artículo</TableHead>
                                    <TableHead className="text-right">Cantidad</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {Array.isArray(request.items) && request.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {request.notes && (
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-2">Notas Adicionales:</h4>
                                <p className="text-sm text-muted-foreground">{request.notes}</p>
                            </div>
                        )}
                         <div className="pt-4 border-t text-xs text-muted-foreground">
                           Requerido para el: <ClientDate value={request.requiredByDate} />
                        </div>

                        <Separator />
                        
                        <CommentSection 
                          entityId={request.id}
                          comments={request.comments || []}
                          currentUser={currentUser}
                          users={users}
                          addCommentAction={addCommentToWarehouseRequest}
                        />

                    </div>
                </AccordionContent>
              </AccordionItem>
            )) : (
                 <div className="text-center py-12 text-muted-foreground">
                    <p>No hay solicitudes de almacén para mostrar.</p>
                </div>
            )}
          </Accordion>
        </CardContent>
      </Card>

        <AlertDialog open={statusChangeState.isOpen} onOpenChange={(open) => !open && setStatusChangeState({ isOpen: false, requestId: null, newStatus: null })}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Cambio de Estado</AlertDialogTitle>
                    <AlertDialogDescription>
                        Para cambiar el estado de la solicitud <span className="font-semibold">{statusChangeState.requestId}</span> a <span className="font-semibold">{statusChangeState.newStatus}</span>, por favor ingresa tu contraseña.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                 <div className="py-2">
                    <Label htmlFor="password-warehouse">Contraseña</Label>
                    <Input 
                    id="password-warehouse" 
                    type="password" 
                    placeholder="••••••••" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmStatusChange()}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setStatusChangeState({ isOpen: false, requestId: null, newStatus: null })}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmStatusChange} disabled={!passwordInput}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
     </>
  )
}
