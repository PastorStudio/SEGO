
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { TaskForm } from "./task-form";
import type { Project } from "@/lib/definitions";

type CreateTaskModalProps = {
    projects: Project[];
}

export function CreateTaskModal({ projects }: CreateTaskModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button><PlusCircle className="mr-2 h-4 w-4" /> Nueva Tarea</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Tarea</DialogTitle>
                    <DialogDescription>
                        Ingresa los detalles para la nueva tarea.
                    </DialogDescription>
                </DialogHeader>
                <TaskForm projects={projects} onFinished={() => setIsOpen(false)} className="p-1"/>
            </DialogContent>
        </Dialog>
    )
}
