
'use client'

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth.tsx';
import { updateUser } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { type User } from '@/lib/definitions';
import { getAvatarUrl } from '@/lib/avatars';

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}

export function AvatarSelector() {
    const { currentUser, setCurrentUser } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!currentUser) return null;

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast({
                    title: "Archivo inválido",
                    description: "Por favor, selecciona un archivo de imagen.",
                    variant: "destructive",
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const dataUrl = e.target?.result as string;
                
                if (!currentUser) return;

                try {
                    const updatedUser: User = { ...currentUser, profilePicture: dataUrl };
                    await updateUser(updatedUser);
                    
                    if(setCurrentUser) {
                        setCurrentUser(updatedUser);
                    }
                    
                    toast({
                        title: "Foto de Perfil Actualizada",
                        description: "Tu nueva foto de perfil ha sido guardada.",
                    });
                } catch (error) {
                    toast({
                        title: "Error",
                        description: "No se pudo guardar tu foto de perfil. Por favor, inténtalo de nuevo.",
                        variant: "destructive",
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="h-24 w-24">
                    <AvatarImage src={currentUser.profilePicture || getAvatarUrl(currentUser.avatar, currentUser.name)} alt={currentUser.name} />
                    <AvatarFallback className="text-3xl">{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Cambiar Foto</span>
                </div>
            </div>
        </div>
    );
}
