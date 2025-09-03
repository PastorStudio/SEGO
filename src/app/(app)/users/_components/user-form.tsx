
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { addUser, updateUser } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/definitions"
import { roles } from "@/lib/definitions"

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Dirección de correo electrónico inválida."),
  phone: z.string().min(10, "El teléfono debe tener al menos 10 caracteres."),
  birthDate: z.string().optional(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").optional().or(z.literal('')),
  role: z.enum(roles),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  workStatus: z.enum(['Activo', 'En Pausa', 'De Baja']).optional(),
})

type UserFormValues = z.infer<typeof formSchema>

export function UserForm({ user }: { user?: User }) {
  const { toast } = useToast()
  const router = useRouter()
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: user ? { ...user, password: ''} : {
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      password: "",
      role: "Agent",
      position: "",
      hireDate: "",
      workStatus: "Activo",
    },
  })

  const onSubmit = async (values: UserFormValues) => {
    try {
      if (user) {
          const updatedUserData: User = { ...user, ...values };
          if (!values.password) {
            delete updatedUserData.password;
          }
          await updateUser(updatedUserData);
          toast({
            title: "Usuario Actualizado",
            description: `El usuario "${values.name}" ha sido actualizado exitosamente.`,
          })
      } else {
          if (!values.password) {
              toast({
                  title: "Error",
                  description: "La contraseña es requerida para nuevos usuarios.",
                  variant: "destructive"
              });
              return;
          }
          const newUser: Omit<User, 'id' | 'company' | 'avatar' | 'status' | 'lastSeen' | 'profilePicture'> = {
              name: values.name,
              email: values.email,
              phone: values.phone,
              birthDate: values.birthDate,
              password: values.password,
              role: values.role,
              position: values.position,
              hireDate: values.hireDate,
              workStatus: values.workStatus,
          };
          await addUser(newUser);
          toast({
            title: "Usuario Creado",
            description: `El usuario "${values.name}" ha sido creado exitosamente.`,
          })
      }
      
      router.push("/users")
      router.refresh()
    } catch(e) {
        toast({
            title: "Error",
            description: "Ocurrió un error al guardar el usuario. Por favor, inténtalo de nuevo.",
            variant: "destructive"
        });
    }
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{user ? "Editar Detalles del Empleado" : "Registrar Nuevo Empleado"}</CardTitle>
            <CardDescription>
                {user ? "Actualiza los detalles del empleado existente." : "Ingresa los detalles para el nuevo empleado."}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl><Input type="tel" placeholder="809-555-1234" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="birthDate" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Fecha de Nacimiento</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                     </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="position" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Cargo</FormLabel>
                            <FormControl><Input placeholder="Agente de Ventas" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="hireDate" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Fecha de Contratación</FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                     </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl><Input type="password" placeholder={user ? "Dejar en blanco para mantener la actual" : "••••••••"} {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                         <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Rol en el Sistema</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecciona un rol" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="Super-Admin">Super-Admin</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Agent">Agente</SelectItem>
                                <SelectItem value="Viewer">Visualizador</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="workStatus" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Estado Laboral</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Activo">Activo</SelectItem>
                                    <SelectItem value="En Pausa">En Pausa</SelectItem>
                                    <SelectItem value="De Baja">De Baja</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )} />
                         <FormItem>
                            <FormLabel>Compañía</FormLabel>
                            <FormControl><Input value="SEGO Eventos Inc." disabled /></FormControl>
                            <FormMessage />
                        </FormItem>
                     </div>
                    <Button type="submit">{user ? 'Actualizar Empleado' : 'Crear Empleado'}</Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  )
}
