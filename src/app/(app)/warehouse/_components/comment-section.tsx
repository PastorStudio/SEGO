

'use client'

import { useState } from "react";
import type { User, Comment } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, AtSign } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils";
import { getAvatarUrl } from "@/lib/avatars";
import { ClientOnly } from "@/components/client-only";


type CommentSectionProps = {
    entityId: string;
    comments: Comment[];
    currentUser: User | null;
    users: User[];
    addCommentAction: (entityId: string, content: string, userId: string) => Promise<Comment>;
}

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}

const parseCommentContent = (content: string) => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push(content.substring(lastIndex, match.index));
        }
        const [fullMatch, name, id] = match;
        parts.push({ name, id });
        lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    return parts.map((part, index) => 
        typeof part === 'string' ? (
            <span key={index}>{part}</span>
        ) : (
            <span key={index} className="font-bold text-primary">
                {part.name}
            </span>
        )
    );
};


export function CommentSection({ entityId, comments: initialComments, currentUser, users, addCommentAction }: CommentSectionProps) {
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");
    const { toast } = useToast();
    const router = useRouter();

    const getUserDetails = (userId: string) => {
        return users.find(u => u.id === userId);
    }
    
    const handleAddMention = (user: User) => {
        const mentionText = `@[${user.name}](${user.id}) `;
        setNewComment(prev => prev + mentionText);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;
        
        try {
            const addedComment = await addCommentAction(entityId, newComment, currentUser.id);

            setComments(prev => [...prev, addedComment]);
            setNewComment("");
            
            toast({
                title: "Comentario añadido",
                description: "Tu comentario ha sido guardado."
            });
            
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo añadir el comentario.",
                variant: "destructive"
            });
        }
    }

    return (
        <div className="space-y-4">
            <h4 className="font-semibold">Comentarios</h4>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {comments.length > 0 ? comments.map(comment => {
                    const user = getUserDetails(comment.userId);
                    return (
                        <div key={comment.id} className="flex items-start gap-3">
                             <Avatar className="h-8 w-8">
                                <AvatarImage src={getAvatarUrl(user?.avatar, user?.name)} alt={user?.name} />
                                <AvatarFallback>{user ? getInitials(user.name) : '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-secondary p-3 rounded-md">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-semibold text-sm">{user?.name || 'Usuario desconocido'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <ClientOnly>
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: es })}
                                        </ClientOnly>
                                    </p>
                                </div>
                                <p className="text-sm">{parseCommentContent(comment.content)}</p>
                            </div>
                        </div>
                    )
                }) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No hay comentarios todavía.</p>
                )}
            </div>
             <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <div className="relative w-full">
                    <Input 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe un comentario... Usa el @ para mencionar"
                        disabled={!currentUser}
                        className="pr-10"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                                <AtSign className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {users.filter(u => u.id !== currentUser?.id).map(user => (
                                <DropdownMenuItem key={user.id} onSelect={() => handleAddMention(user)}>
                                    {user.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Button type="submit" size="icon" disabled={!newComment.trim() || !currentUser}>
                    <Send className="h-4 w-4"/>
                </Button>
            </form>
        </div>
    )
}
