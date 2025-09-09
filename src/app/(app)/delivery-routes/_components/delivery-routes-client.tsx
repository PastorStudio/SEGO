

'use client'

import { type WarehouseRequest, type Project, type User } from "@/lib/definitions";
import { addCommentToWarehouseRequest } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Package, NotebookText, Truck } from "lucide-react";
import { CommentSection } from "../../warehouse/_components/comment-section";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth.tsx";

type GroupedRequests = {
  [date: string]: {
    requests: WarehouseRequest[];
    projectDetails: { [projectId: string]: { name: string; clientName: string; } };
  }
};

type DeliveryRoutesClientProps = {
    groupedRequests: GroupedRequests;
    users: User[];
}

export function DeliveryRoutesClient({ groupedRequests, users }: DeliveryRoutesClientProps) {
  const { currentUser } = useAuth();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
  };
  
  return (
       <div className="space-y-6">
         {Object.keys(groupedRequests).length === 0 ? (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-12 text-muted-foreground">
                        <Truck className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">No hay entregas en proceso</h3>
                        <p className="mt-2 text-sm">Actualmente no hay solicitudes de almacén marcadas como "En Proceso".</p>
                    </div>
                </CardContent>
            </Card>
         ) : (
            Object.entries(groupedRequests).map(([date, { requests, projectDetails }]) => (
                <div key={date}>
                    <h2 className="text-xl font-bold mb-3">{formatDate(date)}</h2>
                    <Card className="shadow-md">
                        <CardContent className="pt-6">
                        <Accordion type="multiple" className="w-full space-y-4">
                            {requests.map(req => (
                                <AccordionItem value={req.id} key={req.id} className="border rounded-md px-4 bg-secondary/50">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-left">
                                           <div className="font-medium text-primary mb-2 sm:mb-0">{req.id}</div>
                                            <div className="flex-1 sm:ml-4">
                                                <p className="font-semibold">{projectDetails[req.projectId]?.name || 'Proyecto no encontrado'}</p>
                                                <p className="text-sm text-muted-foreground">{projectDetails[req.projectId]?.clientName || 'Cliente no encontrado'}</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="p-4 bg-background rounded-md border space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Package className="h-4 w-4" /> Artículos</h4>
                                                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                                                        {req.items.map(item => (
                                                            <li key={item.id}>
                                                                <span className="font-medium text-foreground">{item.quantity}x</span> {item.name}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                {req.notes && (
                                                    <div>
                                                        <h4 className="font-semibold flex items-center gap-2 mb-2"><NotebookText className="h-4 w-4" /> Notas de Entrega</h4>
                                                        <p className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">{req.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <Separator />
                                            <CommentSection
                                                entityId={req.id}
                                                comments={req.comments || []}
                                                currentUser={currentUser}
                                                users={users}
                                                addCommentAction={addCommentToWarehouseRequest}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                        </CardContent>
                    </Card>
                </div>
            ))
         )}
      </div>
  );
}
