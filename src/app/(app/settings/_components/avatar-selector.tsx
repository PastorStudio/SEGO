
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth.tsx';
import { updateUser } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import { type User } from '@/lib/definitions';
import Image from 'next/image';
import { allAvatars, getAvatarUrl } from '@/lib/avatars';


const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}


export function AvatarSelector() {
    const { currentUser, setCurrentUser } = useAuth(); // Assuming useAuth can update the user context
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAvatarId, setSelectedAvatarId] = useState(currentUser?.avatar || 'prof-1');

    if (!currentUser) return null;

    const handleSelectAvatar = (id: string) => {
        setSelectedAvatarId(id);
    };

    const handleSave = async () => {
        if (!currentUser || selectedAvatarId === currentUser.avatar) {
            setIsOpen(false);
            return;
        }

        try {
            const updatedUser: User = { ...currentUser, avatar: selectedAvatarId };
            await updateUser(updatedUser);
            
            if(setCurrentUser) {
                setCurrentUser(updatedUser);
            }
            
            toast({
                title: "Avatar Actualizado",
                description: "Tu nuevo avatar ha sido guardado.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo guardar tu avatar. Por favor, inténtalo de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsOpen(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="relative group cursor-pointer">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={currentUser.profilePicture || getAvatarUrl(currentUser.avatar, currentUser.name)} alt={currentUser.name} />
                        <AvatarFallback className="text-3xl">{getInitials(currentUser.name)}</AvatarFallback>
                    </Avatar>
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold">Cambiar</span>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Selecciona tu Avatar</DialogTitle>
                    <DialogDescription>
                        Elige uno de los avatares para tu perfil. Haz clic en guardar cuando hayas elegido.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-5 sm:grid-cols-8 gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    {allAvatars.map(({id}) => (
                        <div 
                            key={id}
                            className="relative cursor-pointer"
                            onClick={() => handleSelectAvatar(id)}
                        >
                            <div className={cn("p-1 rounded-full border-2 transition-all",
                                selectedAvatarId === id ? "border-primary bg-primary/10" : "border-transparent"
                            )}>
                               <Avatar>
                                 <AvatarImage src={getAvatarUrl(id, currentUser.name)} alt={id} />
                                 <AvatarFallback>{id.substring(0,2)}</AvatarFallback>
                               </Avatar>
                            </div>
                            
                            {selectedAvatarId === id && (
                                <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1 border-2 border-background">
                                    <CheckCircle className="h-4 w-4 text-primary-foreground" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancelar</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSave}>Guardar Avatar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
