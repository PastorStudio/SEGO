
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { addClient, updateClient } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Client } from "@/lib/definitions"
import { ScrollArea } from "@/components/ui/scroll-area"

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Dirección de correo electrónico inválida."),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 caracteres."),
  company: z.string().optional(),
})

type ClientFormValues = z.infer<typeof formSchema>

type ClientFormProps = {
    client?: Client;
    onFinished?: () => void;
}

export function ClientForm({ client, onFinished }: ClientFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: client ? { ...client } : {
      name: "",
      email: "",
      phone: "",
      company: "",
    },
  })

  const onSubmit = async (values: ClientFormValues) => {
    try {
      if (client) {
          const updatedClientData: Client = { ...client, ...values };
          await updateClient(updatedClientData);
          toast({
            title: "Cliente Actualizado",
            description: `El cliente "${values.name}" ha sido actualizado exitosamente.`,
          })
      } else {
          await addClient(values);
          toast({
            title: "Cliente Creado",
            description: `El cliente "${values.name}" ha sido creado exitosamente.`,
          })
      }
      
      if(onFinished) {
        onFinished();
      } else {
        router.push("/clients")
      }
      router.refresh()
    } catch(e) {
        toast({
            title: "Error",
            description: "Ocurrió un error al guardar el cliente. Por favor, inténtalo de nuevo.",
            variant: "destructive"
        });
    }
  }

  const content = (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                    <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
              <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                    <Input placeholder="809-123-4567" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
              <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Compañía (Opcional)</FormLabel>
                <FormControl>
                    <Input placeholder="ACME Inc." {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="flex justify-end gap-2">
                {onFinished && <Button type="button" variant="ghost" onClick={onFinished}>Cancelar</Button>}
                <Button type="submit">{client ? 'Actualizar Cliente' : 'Crear Cliente'}</Button>
            </div>
        </form>
    </Form>
  )

  if (client) {
    // If it's an edit form, render it in a card
    return (
        <Card>
            <CardHeader>
                <CardTitle>Editar Detalles del Cliente</CardTitle>
                <CardDescription>
                    Actualiza los detalles del cliente existente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {content}
            </CardContent>
        </Card>
    )
  }

  // Otherwise, it's a creation form (for modal), wrap it in a ScrollArea
  return (
    <ScrollArea className="h-[70vh] p-1 pr-4">
      {content}
    </ScrollArea>
  );
}
