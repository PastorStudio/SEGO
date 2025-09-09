

'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { deleteInvoice, updateInvoiceStatus } from "@/lib/data"
import type { Invoice, Client } from "@/lib/definitions";
import { Send, Trash2, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth.tsx";
import { ClientDate, ClientNumber } from "@/components/client-only";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const statusVariant: { [key in Invoice['status']]: "default" | "secondary" | "destructive" | "outline" } = {
  "Paid": "secondary",
  "Pending": "default",
  "Overdue": "destructive",
  "Draft": "outline",
}

const statusTranslate: { [key in Invoice['status']]: string } = {
    "Paid": "Pagada",
    "Pending": "Pendiente",
    "Overdue": "Vencida",
    "Draft": "Borrador",
}

const rowColorVariant: { [key in Invoice['status']]?: string } = {
  "Overdue": "bg-red-500/10 hover:bg-red-500/20",
  "Paid": "bg-green-500/10 hover:bg-green-500/20",
}

type InvoiceListProps = {
    initialInvoices: Invoice[];
    initialClients: Client[];
}

export function InvoiceList({ initialInvoices, initialClients }: InvoiceListProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [passwordInput, setPasswordInput] = useState("");

  const handleSendWhatsApp = (invoice: Invoice) => {
    // This is a placeholder for the actual PDF generation and WhatsApp API integration.
     toast({
        title: "Función no disponible",
        description: "La generación de PDF y envío por WhatsApp se implementará en el futuro.",
        variant: "default"
      })
  }

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'N/A';
  }

  const openDeleteDialog = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteDialogOpen(true);
    setPasswordInput("");
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete || !currentUser || !currentUser.password) {
      toast({ title: "Error", description: "No se pudo verificar el usuario.", variant: "destructive" });
      return;
    }

    if (passwordInput !== currentUser.password) {
      toast({ title: "Contraseña Incorrecta", description: "La contraseña ingresada no es correcta.", variant: "destructive" });
      return;
    }
    
    try {
      await deleteInvoice(invoiceToDelete.id);
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete.id));
      toast({ title: "Factura Eliminada", description: `La factura ${invoiceToDelete.id} ha sido eliminada.` });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la factura.", variant: "destructive" });
    } finally {
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };
  
  const handleStatusChange = async (invoiceId: string, newStatus: Invoice['status']) => {
    if (!currentUser) return;
    
    // Optimistic update
    const originalInvoices = [...invoices];
    const updatedInvoices = invoices.map(inv => inv.id === invoiceId ? {...inv, status: newStatus} : inv);
    setInvoices(updatedInvoices);

    try {
        await updateInvoiceStatus(invoiceId, newStatus, currentUser.name);
        toast({
            title: "Estado Actualizado",
            description: `La factura ${invoiceId} ha sido actualizada a "${statusTranslate[newStatus]}".`
        });
        router.refresh(); // Re-fetch server data to confirm
    } catch (e) {
        setInvoices(originalInvoices); // Rollback on error
        toast({
            title: "Error",
            description: "No se pudo actualizar el estado.",
            variant: "destructive"
        })
    }
  }

  const canDeleteInvoices = currentUser?.role === 'Super-Admin' || currentUser?.role === 'Admin';
  const canEditStatus = currentUser?.role === 'Super-Admin' || currentUser?.role === 'Admin';

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura / Cliente</TableHead>
                <TableHead className="hidden sm:table-cell w-[150px]">Estado</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length > 0 ? invoices.map((invoice) => (
                <TableRow key={invoice.id} className={cn(rowColorVariant[invoice.status])}>
                  <TableCell>
                    <div className="font-medium">{invoice.id}</div>
                    <div className="text-sm text-muted-foreground">{getClientName(invoice.clientId)}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {canEditStatus ? (
                         <Select value={invoice.status} onValueChange={(newStatus: Invoice['status']) => handleStatusChange(invoice.id, newStatus)}>
                             <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Draft">Borrador</SelectItem>
                                <SelectItem value="Pending">Pendiente</SelectItem>
                                <SelectItem value="Paid">Pagada</SelectItem>
                                <SelectItem value="Overdue">Vencida</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                         <Badge variant={statusVariant[invoice.status]}>{statusTranslate[invoice.status]}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell"><ClientDate value={invoice.issueDate} /></TableCell>
                  <TableCell className="text-right"><ClientNumber value={invoice.amount} /></TableCell>
                   <TableCell className="text-center">
                    <TooltipProvider>
                       <Tooltip>
                        <TooltipTrigger asChild>
                           <Button asChild variant="ghost" size="icon">
                             <Link href={`/invoices/${invoice.id}`}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">Ver Factura</span>
                              </Link>
                           </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver/Editar Factura</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleSendWhatsApp(invoice)}
                            >
                              <Send className="h-4 w-4" />
                              <span className="sr-only">Enviar por WhatsApp</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enviar factura por WhatsApp (PDF)</p>
                        </TooltipContent>
                      </Tooltip>
                      {canDeleteInvoices && (
                         <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => openDeleteDialog(invoice)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Eliminar Factura</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Eliminar Factura</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center">No hay facturas para mostrar.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la factura <span className="font-semibold">{invoiceToDelete?.id}</span>.
              <br/>
              Para confirmar, por favor ingresa tu contraseña.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={!passwordInput}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
