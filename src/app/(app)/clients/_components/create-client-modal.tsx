
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { ClientForm } from "./client-form";

export function CreateClientModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Cliente</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Cliente</DialogTitle>
                    <DialogDescription>
                        Ingresa los detalles para registrar un nuevo cliente en el sistema.
                    </DialogDescription>
                </DialogHeader>
                <ClientForm onFinished={() => setIsOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}
