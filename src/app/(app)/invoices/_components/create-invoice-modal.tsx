
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { InvoiceForm } from "./invoice-form";
import type { Client, Project } from "@/lib/definitions";

type CreateInvoiceModalProps = {
    clients: Client[];
    projects: Project[];
}

export function CreateInvoiceModal({ clients, projects }: CreateInvoiceModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Nueva Factura
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Factura</DialogTitle>
                </DialogHeader>
                <InvoiceForm 
                    clients={clients} 
                    projects={projects} 
                    onFinished={() => setIsOpen(false)} 
                />
            </DialogContent>
        </Dialog>
    )
}
