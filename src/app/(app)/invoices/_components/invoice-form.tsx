
"use client"

import { useFieldArray, useForm } from "react-hook-form"
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { addInvoice, updateInvoice, getUsers, getProjects } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { Client, Invoice, InvoiceItem, User, Project } from "@/lib/definitions"
import { Logo } from "@/components/logo"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from 'date-fns/locale'
import { Textarea } from "@/components/ui/textarea"
import { services } from "@/lib/services"
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth.tsx"
import { ScrollArea } from "@/components/ui/scroll-area"

const invoiceItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "La descripción es requerida."),
  quantity: z.coerce.number().min(1, "La cantidad debe ser al menos 1."),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  serviceId: z.string().optional(), // Used to track which service is selected
});

const formSchema = z.object({
  clientId: z.string().min(1, "Se requiere un cliente."),
  projectId: z.string().min(1, "Se requiere un proyecto."),
  salespersonId: z.string().min(1, "Se requiere un vendedor."),
  status: z.enum(['Paid', 'Pending', 'Overdue', 'Draft']),
  ncf: z.string().optional(),
  issueDate: z.date({ required_error: "La fecha de emisión es requerida." }),
  dueDate: z.date({ required_error: "La fecha de vencimiento es requerida." }),
  items: z.array(invoiceItemSchema).min(1, "Se requiere al menos un ítem."),
  notes: z.string().optional(),
})

type InvoiceFormValues = z.infer<typeof formSchema>

const ITBIS_RATE = 0.18;

// Flatten services for easy lookup
const allServices = services.flatMap(category => 
    category.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: category.category
    }))
);


type InvoiceFormProps = {
    invoice?: Invoice, 
    clients: Client[], 
    projects: Project[],
    onFinished?: () => void;
}

export function InvoiceForm({ invoice, clients, projects, onFinished }: InvoiceFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { currentUser } = useAuth();
  const [salesAgents, setSalesAgents] = useState<User[]>([]);

  useEffect(() => {
    async function fetchAgents() {
        const allUsers = await getUsers();
        const agents = allUsers.filter(u => u.role === 'Admin' || u.role === 'Agent' || u.role === 'Super-Admin');
        setSalesAgents(agents);
    }
    fetchAgents();
  }, [])
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: invoice ? {
        ...invoice,
        issueDate: new Date(invoice.issueDate),
        dueDate: new Date(invoice.dueDate),
    } : {
      clientId: "",
      projectId: "",
      salespersonId: "",
      status: "Draft",
      ncf: "",
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, price: 0, serviceId: "" }],
      notes: "El pago debe realizarse 20 días antes de la fecha del evento."
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const itbis = subtotal * ITBIS_RATE;
  const total = subtotal + itbis;

  const handleServiceChange = (serviceId: string, index: number) => {
    const selectedService = allServices.find(s => s.id === serviceId);
    if (selectedService) {
      form.setValue(`items.${index}.description`, selectedService.name, { shouldValidate: true });
      form.setValue(`items.${index}.price`, selectedService.price, { shouldValidate: true });
      form.setValue(`items.${index}.serviceId`, serviceId, { shouldValidate: true });
    }
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    if (!currentUser) return;
    try {
      const invoiceData = {
          ...values,
          issueDate: values.issueDate.toISOString(),
          dueDate: values.dueDate.toISOString(),
          amount: total,
      }

      if (invoice) {
          const updatedInvoiceData: Invoice = { ...invoice, ...invoiceData };
          await updateInvoice(updatedInvoiceData, currentUser.name);
          toast({
            title: "Factura Actualizada",
            description: `La factura "${invoice.id}" ha sido actualizada exitosamente.`,
          })
      } else {
          const newInvoice = await addInvoice(invoiceData, currentUser.name);
          toast({
            title: "Factura Creada",
            description: `La factura "${newInvoice.id}" ha sido creada exitosamente.`,
          })
          if (!onFinished) {
            router.push(`/invoices/${newInvoice.id}`)
          }
      }

      if (onFinished) {
        onFinished();
      }
      router.refresh()

    } catch(e) {
        toast({
            title: "Error",
            description: "Ocurrió un error al guardar la factura. Por favor, inténtalo de nuevo.",
            variant: "destructive"
        });
    }
  }

  const selectedClient = clients.find(c => c.id === form.watch("clientId"));

  const formContent = (
     <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className={cn(!invoice && "h-[75vh]")}>
                <div className="p-1">
                    <CardHeader className="p-6 bg-secondary/30">
                        <div className="flex flex-col items-center text-center space-y-2 mb-6">
                            <Logo className="h-12 w-12 text-primary" />
                            <h1 className="text-2xl font-bold">SEGO Eventos, SRL</h1>
                            <p className="text-sm text-muted-foreground">
                                Av. John F. Kennedy, Plaza Sambil, Nivel 1<br />
                                Santo Domingo, República Dominicana<br />
                                (809) 123-4567 | info@segoeventos.com
                            </p>
                        </div>
                        <FormField
                            control={form.control}
                            name="ncf"
                            render={({ field }) => (
                                <FormItem className="max-w-xs mx-auto">
                                    <FormLabel>NCF (Comprobante Fiscal)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="B0100000001" {...field} className="text-center font-mono"/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-semibold">Facturar A:</h3>
                                <FormField
                                    control={form.control}
                                    name="clientId"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Cliente</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar un cliente" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {clients.map(client => (
                                                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        {selectedClient && (
                                            <div className="text-sm text-muted-foreground mt-2">
                                                <p>{selectedClient.email}</p>
                                                <p>{selectedClient.phone}</p>
                                                <p>{selectedClient.company}</p>
                                            </div>
                                        )}
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar un proyecto" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            {projects.map(project => (
                                                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                                            ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                            </div>
                            <div className="space-y-4 md:text-right">
                                <FormField
                                    control={form.control}
                                    name="issueDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Fecha de Emisión</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: es })
                                                ) : (
                                                    <span>Elige una fecha</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Fecha de Vencimiento</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                >
                                                {field.value ? (
                                                    format(field.value, "PPP", { locale: es })
                                                ) : (
                                                    <span>Elige una fecha</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                            </div>
                            <div className="space-y-4 md:text-right">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                        <FormLabel>Estado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Draft">Borrador</SelectItem>
                                                <SelectItem value="Pending">Pendiente</SelectItem>
                                                <SelectItem value="Paid">Pagada</SelectItem>
                                                <SelectItem value="Overdue">Vencida</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="salespersonId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Vendedor</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar Vendedor" />
                                                </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                {salesAgents.map(agent => (
                                                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                                                ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary">
                                    <tr>
                                        <th className="p-2 text-left font-semibold">Servicio / Descripción</th>
                                        <th className="p-2 text-right font-semibold w-24">Cantidad</th>
                                        <th className="p-2 text-right font-semibold w-32">Precio Unit.</th>
                                        <th className="p-2 text-right font-semibold w-32">Total</th>
                                        <th className="p-2 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className="border-b">
                                            <td>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.serviceId`}
                                                    render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={(value) => {
                                                            field.onChange(value)
                                                            handleServiceChange(value, index)
                                                        }} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="border-0 rounded-none">
                                                                <SelectValue placeholder="Seleccionar un servicio" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {services.map(category => (
                                                                <SelectGroup key={category.category}>
                                                                    <Label className="px-2 py-1.5 text-xs font-semibold">{category.category}</Label>
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
                                            </td>
                                            <td>
                                                <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                                                    <Input type="number" {...field} className="text-right border-0 rounded-none"/>
                                                )}/>
                                            </td>
                                            <td>
                                                <FormField control={form.control} name={`items.${index}.price`} render={({ field }) => (
                                                    <Input type="number" step="0.01" {...field} className="text-right border-0 rounded-none"/>
                                                )}/>
                                            </td>
                                            <td className="p-2 text-right">
                                                {((watchItems[index]?.quantity || 0) * (watchItems[index]?.price || 0)).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}
                                            </td>
                                            <td className="p-2 text-center">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ id: `item-${Date.now()}`, description: "", quantity: 1, price: 0, serviceId: "" })}
                            >
                            Agregar Ítem
                        </Button>

                        <div className="flex justify-end">
                            <div className="w-full max-w-sm space-y-2">
                                <Separator />
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>{subtotal.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ITBIS ({(ITBIS_RATE * 100).toFixed(0)}%):</span>
                                    <span>{itbis.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>{total.toLocaleString('es-DO', { style: 'currency', currency: 'DOP' })}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />
                        
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas y Términos de Pago</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Escribe notas adicionales aquí..." {...field}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                    </CardContent>
                </div>
            </ScrollArea>
             <CardFooter className="flex justify-between p-6 bg-secondary/30 mt-4">
                <Button type="button" variant="outline" onClick={() => onFinished ? onFinished() : router.back()}>Cancelar</Button>
                <Button type="submit">{invoice ? 'Actualizar Factura' : 'Guardar Factura'}</Button>
            </CardFooter>
        </form>
    </Form>
  )

  if (invoice) {
    // Edit page
    return (
        <Card className="border-2 border-primary/20 shadow-lg">
            {formContent}
        </Card>
    );
  }

  // Create modal
  return formContent;
}
