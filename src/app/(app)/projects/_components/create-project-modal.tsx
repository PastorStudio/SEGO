
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { ProjectForm } from "./project-form";

export function CreateProjectModal() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Proyecto</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                    <DialogDescription>
                        Ingresa los detalles para el nuevo proyecto.
                    </DialogDescription>
                </DialogHeader>
                <ProjectForm onFinished={() => setIsOpen(false)} className="px-1" />
            </DialogContent>
        </Dialog>
    )
}
