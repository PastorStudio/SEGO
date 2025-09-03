

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
import { type User, deleteUser } from "@/lib/data"
import { useAuth } from "@/hooks/use-auth.tsx"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export function UserActions({ user }: { user: User }) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const { currentUser } = useAuth()

  const handleDelete = async () => {
     if (!currentUser || !currentUser.password) {
      toast({ title: "Error", description: "No se pudo verificar el usuario actual.", variant: "destructive" });
      return;
    }

    if (passwordInput !== currentUser.password) {
      toast({ title: "Contraseña Incorrecta", description: "La contraseña ingresada no es correcta.", variant: "destructive" });
      return;
    }

    try {
      await deleteUser(user.id)
      
      toast({
          title: "Usuario Eliminado",
          description: `El usuario "${user.name}" ha sido eliminado exitosamente.`,
      })
      
      router.refresh()
    } catch (error) {
       toast({
        title: "Error",
        description: "No se pudo eliminar el usuario. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setPasswordInput("")
    }
  }
  
  const canDeleteUsers = currentUser?.role === 'Super-Admin' || currentUser?.role === 'Admin';


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
            <Link href={`/users/${user.id}`}>Ver Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/users/${user.id}/edit`}>Editar Usuario</Link>
          </DropdownMenuItem>
          {canDeleteUsers && (
             <DropdownMenuItem
                className="text-destructive"
                onSelect={() => setIsDeleteDialogOpen(true)}
             >
                Eliminar Usuario
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
              usuario <span className="font-semibold">"{user.name}"</span>.
               Para confirmar, por favor ingresa tu contraseña.
            </AlertDialogDescription>
          </AlertDialogHeader>
            <div className="py-2">
                <Label htmlFor="password-user">Contraseña</Label>
                <Input 
                id="password-user" 
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

    