

"use client";

import { useFieldArray, useForm } from "react-hook-form";
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
  SelectGroup,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { addWarehouseRequest } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { services } from "@/lib/services";
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { type User, type Project } from "@/lib/definitions";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth.tsx";

const requestItemSchema = z.object({
  id: z.string().min(1, "Debe seleccionar un artículo."),
  name: z.string(),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
});

const formSchema = z.object({
  projectId: z.string().min(1, "Debes seleccionar un proyecto."),
  requiredByDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Fecha inválida" }),
  items: z.array(requestItemSchema).min(1, "Se requiere al menos un artículo."),
  notes: z.string().optional(),
});

type WarehouseRequestFormValues = z.infer<typeof formSchema>;

// Flatten services for easy lookup
const allServices = services.flatMap(category => 
    category.items.map(item => ({
        id: item.id,
        name: item.name,
    }))
);

export function WarehouseRequestForm({ projects }: { projects: Project[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const { currentUser } = useAuth();

  const form = useForm<WarehouseRequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: "",
      requiredByDate: "",
      items: [],
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleServiceChange = (serviceId: string, index: number) => {
    const selectedService = allServices.find(s => s.id === serviceId);
    if (selectedService) {
      form.setValue(`items.${index}.name`, selectedService.name, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: WarehouseRequestFormValues) => {
    if (!currentUser) {
        toast({
            title: "Error de autenticación",
            description: "No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.",
            variant: "destructive",
        });
        return;
    }

    try {
      const requestData = {
          ...values,
          requestDate: new Date().toISOString(),
          requesterId: currentUser.id,
          status: 'Pending' as const,
      };
      await addWarehouseRequest(requestData, currentUser.name);
      toast({
        title: "Solicitud Creada",
        description: "Tu solicitud al almacén ha sido creada exitosamente.",
      });
      router.push("/warehouse");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalles de la Solicitud</CardTitle>
        <CardDescription>
          Completa los detalles para solicitar artículos al almacén.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Proyecto</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                name="requiredByDate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Fecha Requerida</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div>
                <Label>Artículos Requeridos</Label>
                <div className="mt-2 space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4 p-4 border rounded-md">
                            <div className="flex-grow">
                                <FormField
                                    control={form.control}
                                    name={`items.${index}.id`}
                                    render={({ field: selectField }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only">Artículo</FormLabel>
                                        <Select onValueChange={(value) => {
                                            selectField.onChange(value)
                                            handleServiceChange(value, index)
                                        }} defaultValue={selectField.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar un artículo/servicio" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {services.map(category => (
                                                <SelectGroup key={category.category}>
                                                    <FormLabel className="px-2 py-1.5 text-xs font-semibold">{category.category}</FormLabel>
                                                    {category.items.map(item => (
                                                        <SelectItem key={item.id} value={item.id}>
                                                            {item.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                            </div>
                            <div className="w-24">
                               <FormField
                                    control={form.control}
                                    name={`items.${index}.quantity`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Cantidad</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Cant." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                            </Button>
                        </div>
                    ))}
                </div>
                 <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => append({ id: "", name: "", quantity: 1 })}
                    >
                    Agregar Artículo
                </Button>
            </div>
             <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Notas Adicionales</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Ej: Entregar en la puerta trasera, preguntar por Juan..." {...field}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit">Crear Solicitud</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
