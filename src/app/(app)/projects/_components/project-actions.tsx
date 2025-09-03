"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { type Project, deleteProject } from "@/lib/data"
import { useAuth } from "@/hooks/use-auth.tsx"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function ProjectActions({ project }: { project: Project }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { currentUser } = useAuth()
  const [passwordInput, setPasswordInput] = useState("")
  
  const canDeleteProjects = currentUser?.role === 'Super-Admin' || currentUser?.role === 'Admin';


  const handleDelete = async () => {
    if (!currentUser || !currentUser.password) {
      toast({ title: "Error", description: "No se pudo verificar el usuario.", variant: "destructive" });
      return;
    }

    if (passwordInput !== currentUser.password) {
      toast({ title: "Contraseña Incorrecta", description: "La contraseña ingresada no es correcta.", variant: "destructive" });
      return;
    }

    try {
      await deleteProject(project.id)
      
      toast({
          title: "Proyecto Eliminado",
          description: `El proyecto "${project.name}" ha sido eliminado exitosamente.`,
      })
      
      router.refresh()
    } catch (error) {
       toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setPasswordInput("")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/projects/${project.id}`}>Ver Detalles</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/projects/${project.id}/edit`}>Editar</Link>
          </DropdownMenuItem>
          {canDeleteProjects && (
            <DropdownMenuItem
                className="text-destructive"
                onSelect={() => setIsDeleteDialogOpen(true)}
            >
                Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el
              proyecto <span className="font-semibold">"{project.name}"</span>.
              Para confirmar, por favor ingresa tu contraseña.
            </AlertDialogDescription>
          </AlertDialogHeader>
           <div className="py-2">
                <Label htmlFor="password-project">Contraseña</Label>
                <Input 
                id="password-project" 
                type="password" 
                placeholder="••••••••" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
                />
            </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!passwordInput}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

    