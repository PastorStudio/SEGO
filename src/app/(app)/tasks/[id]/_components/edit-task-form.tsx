'use client';

import { useState, useTransition } from 'react';
import { type Task } from "@/lib/definitions";
import { updateTask } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';


type EditTaskFormProps = {
  task: Task;
}

export function EditTaskForm({ task }: EditTaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState<Task['status']>(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateTask({
          id: task.id,
          title,
          status,
          dueDate,
        });
        toast({ title: "Tarea Actualizada", description: "Los cambios en la tarea han sido guardados." });
        router.push(`/projects/${task.projectId}`); // Navigate back to the project
      } catch (error) {
        console.error(error);
        toast({ title: "Error", description: "No se pudo actualizar la tarea.", variant: "destructive" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Tarea</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Do">Por Hacer</SelectItem>
                <SelectItem value="In Progress">En Progreso</SelectItem>
                <SelectItem value="Done">Hecho</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Fecha Límite</Label>
            <Input id="dueDate" type="date" value={dueDate.split('T')[0]} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
