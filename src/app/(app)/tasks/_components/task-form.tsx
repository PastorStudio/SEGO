
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { type Task, type Project, addTask } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(2, "El título debe tener al menos 2 caracteres."),
  projectId: z.string().min(1, "Debes seleccionar un proyecto."),
  status: z.enum(["To Do", "In Progress", "Done"]),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
});

type TaskFormValues = z.infer<typeof formSchema>;

type TaskFormProps = {
  task?: Task;
  projects: Project[];
  onFinished?: () => void;
  className?: string;
}

export function TaskForm({ task, projects, onFinished, className }: TaskFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser } = useAuth();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: task
      ? { ...task }
      : {
          title: "",
          projectId: "",
          status: "To Do",
          dueDate: "",
        },
  });

  const onSubmit = async (values: TaskFormValues) => {
    if (!currentUser) {
       toast({
        title: "Error",
        description: "No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.",
        variant: "destructive",
      });
      return;
    }
    try {
      if (task) {
        // await updateTask({ ...task, ...values });
        toast({
          title: "Tarea Actualizada",
          description: `La tarea "${values.title}" ha sido actualizada.`,
        });
      } else {
        await addTask(values, currentUser.name);
        toast({
          title: "Tarea Creada",
          description: `La tarea "${values.title}" ha sido creada.`,
        });
      }

      if (onFinished) {
        onFinished();
      } else {
        router.push("/tasks");
      }
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          "Ocurrió un error al guardar la tarea. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const content = (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-8", className)}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título de la Tarea</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Diseñar la página de inicio"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proyecto</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un proyecto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="To Do">Por Hacer</SelectItem>
                    <SelectItem value="In Progress">En Progreso</SelectItem>
                    <SelectItem value="Done">Hecho</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Entrega</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            {onFinished && <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>}
            <Button type="submit">{task ? "Actualizar Tarea" : "Crear Tarea"}</Button>
          </div>
        </form>
      </Form>
  )


  if (task) {
    return (
        <Card>
        <CardHeader>
            <CardTitle>
            {task ? "Editar Detalles de la Tarea" : "Nuevos Detalles de la Tarea"}
            </CardTitle>
            <CardDescription>
            {task
                ? "Actualiza los detalles de la tarea existente."
                : "Ingresa los detalles para la nueva tarea."}
            </CardDescription>
        </CardHeader>
        <CardContent>
            {content}
        </CardContent>
        </Card>
    );
  }

  return (
     <ScrollArea className="h-[70vh]">
        {content}
    </ScrollArea>
  )
}
