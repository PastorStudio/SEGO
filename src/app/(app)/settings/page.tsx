
'use client'

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { getPermissions, updatePermissions } from "@/lib/data"
import { type Role, type Page, type Permissions, pages, roles } from "@/lib/definitions"
import { useAuth } from "@/hooks/use-auth.tsx"
import { Skeleton } from "@/components/ui/skeleton"
import { ThemeSwitcher } from "./_components/theme-switcher"
import { AvatarSelector } from "./_components/avatar-selector"
import { ClientOnly } from "@/components/client-only"

const pageTranslations: Record<Page, string> = {
    "Dashboard": "Dashboard",
    "Analytics": "Análisis y Reportes",
    "Recursos Humanos": "Recursos Humanos",
    "Administración y Supervisión": "Administración y Supervisión",
    "Trabajo inmediato": "Trabajo Inmediato",
    "Projects": "Proyectos",
    "Tasks": "Tareas",
    "Invoices": "Facturas",
    "Users & Companies": "Usuarios y Compañías",
    "Services": "Servicios",
    "Warehouse": "Almacén",
    "Montaje": "Montaje (Diseño Visual)",
    "Reparto": "Reparto (Logística)",
    "Cuentas por Cobrar": "Cuentas por Cobrar",
    "Settings": "Configuración",
    "Clients": "Clientes",
    "Chat": "Chat",
    "Tickets": "Tickets",
    "Nuestras Fiestas": "Nuestras Fiestas",
}

const roleTranslations: Record<Role, string> = {
    "Super-Admin": "Super-Admin",
    "Admin": "Admin",
    "Agent": "Agente",
    "Viewer": "Visualizador"
}

export default function SettingsPage() {
  const [permissions, setPermissions] = useState<Permissions | null>(null)
  const { currentUser } = useAuth();
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      const perms = await getPermissions();
      setPermissions(perms);
    }
    fetchData();
  }, []);

  const handlePermissionChange = (role: Role, page: Page, checked: boolean) => {
    if (role === 'Super-Admin' || !permissions) return;
    setPermissions(prev => {
        if (!prev) return null;
        return {
          ...prev,
          [role]: {
            ...prev[role],
            [page]: checked
          }
        }
    });
  }

  const handleSaveChanges = async () => {
    if (!permissions) return;
    try {
      await updatePermissions(permissions)
      toast({
          title: "Permisos Actualizados",
          description: "Los permisos de los roles han sido guardados exitosamente.",
      })
    } catch (error) {
       toast({
          title: "Error",
          description: "No se pudo guardar los permisos.",
          variant: 'destructive'
      })
    }
  }

  if (!permissions || !currentUser) {
    return (
       <>
        <PageHeader title="Configuración" />
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-24" />
                </CardContent>
            </Card>
        </div>
       </>
    )
  }

  const availableRoles = roles.filter(r => r !== 'Super-Admin') as Exclude<Role, 'Super-Admin'>[];
  
  const displayPages = pages;

  return (
    <>
      <PageHeader title="Configuración">
        <ClientOnly>
          <ThemeSwitcher />
        </ClientOnly>
      </PageHeader>
      <div className="flex flex-col gap-8">
         <div className="grid gap-8 md:grid-cols-3">
             <Card className="md:col-span-1">
                <CardHeader>
                    <CardTitle>Mi Perfil</CardTitle>
                    <CardDescription>Gestiona tu foto de perfil y tu nombre.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-col items-center">
                    <AvatarSelector />
                    <div className="text-center">
                        <p className="font-bold text-lg">{currentUser.name}</p>
                        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                    </div>
                </CardContent>
            </Card>
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Contraseña</CardTitle>
                    <CardDescription>Cambia tu contraseña. Se recomienda usar una contraseña fuerte y única.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Contraseña Actual</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input id="new-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Actualizar Contraseña</Button>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Gestión de Roles</CardTitle>
                <CardDescription>Selecciona qué páginas son visibles para cada rol en el sistema.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Página / Rol</TableHead>
                                {availableRoles.map(role => <TableHead key={role} className="text-center">{roleTranslations[role]}</TableHead>)}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {displayPages.map(page => (
                                <TableRow key={page}>
                                    <TableCell className="font-medium">{pageTranslations[page as Page] || page}</TableCell>
                                    {availableRoles.map(role => (
                                        <TableCell key={role} className="text-center">
                                            <Checkbox
                                                checked={permissions[role]?.[page] ?? false}
                                                onCheckedChange={(checked) => handlePermissionChange(role, page, !!checked)}
                                                disabled={role === 'Admin' && page === 'Settings' && currentUser.role !== 'Super-Admin'}
                                                aria-label={`Permiso para que ${role} acceda a ${page}`}
                                            />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSaveChanges}>Guardar Permisos</Button>
                </div>
            </CardContent>
        </Card>
      </div>
    </>
  )
}
