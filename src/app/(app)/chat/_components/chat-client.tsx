

'use client'

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { type User, type ChatMessage, addChatMessage, getPrivateChatMessages, getGeneralChatMessages, getUnreadMessageCount, markChatAsRead } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Users, MessageSquare, Smile, Paperclip } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ClientOnly } from "@/components/client-only";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAvatarUrl } from "@/lib/avatars";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useTheme } from "next-themes";


const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
};

const POLLING_INTERVAL = 5000; // 5 seconds

type ChatClientProps = {
    users: User[];
    initialGeneralMessages: ChatMessage[];
    initialSelectedUserId?: string | null;
}

export function ChatClient({ users, initialGeneralMessages, initialSelectedUserId }: ChatClientProps) {
    const { currentUser } = useAuth();
    const { theme } = useTheme();
    const [selectedChat, setSelectedChat] = useState<User | 'general'>('general');
    const [messages, setMessages] = useState<ChatMessage[]>(initialGeneralMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const otherUsers = users.filter(u => u.id !== currentUser?.id);

    useEffect(() => {
        if (initialSelectedUserId) {
            const userToSelect = users.find(u => u.id === initialSelectedUserId);
            if (userToSelect) {
                setSelectedChat(userToSelect);
            }
        }
    }, [initialSelectedUserId, users]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchUnreadCounts = async () => {
        if(currentUser) {
            const counts = await getUnreadMessageCount(currentUser.id);
            setUnreadCounts(counts);
        }
    }
    
    const fetchMessages = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            if (selectedChat === 'general') {
                const generalMessages = await getGeneralChatMessages();
                setMessages(generalMessages);
            } else {
                await markChatAsRead(currentUser.id, selectedChat.id);
                const privateMessages = await getPrivateChatMessages(currentUser.id, selectedChat.id);
                setMessages(privateMessages);
                fetchUnreadCounts(); // Refresh unread counts after marking as read
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [selectedChat, currentUser]);

     useEffect(() => {
        fetchUnreadCounts();
        const interval = setInterval(async () => {
            await fetchUnreadCounts();
            // Also refresh messages for the current chat
            if (selectedChat === 'general') {
                setMessages(await getGeneralChatMessages());
            } else if (currentUser) {
                setMessages(await getPrivateChatMessages(currentUser.id, selectedChat.id));
            }
        }, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, [currentUser, selectedChat]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const recipientId = selectedChat === 'general' ? undefined : selectedChat.id;
        
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: ChatMessage = {
            id: tempId,
            senderId: currentUser.id,
            content: newMessage,
            createdAt: new Date().toISOString(),
            read: false,
            recipientId
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage("");

        try {
            const savedMessage = await addChatMessage(newMessage, currentUser.id, recipientId);
            setMessages(prev => prev.map(msg => msg.id === tempId ? savedMessage : msg));
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
        }
    }
    
    const onEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    const getUserById = (id: string) => users.find(u => u.id === id);

    const chatTitle = selectedChat === 'general' ? 'Team Sego' : selectedChat.name;
    
    if (!currentUser) {
        return <div>Cargando...</div>
    }
    
    const currentUserAvatarSrc = getAvatarUrl(currentUser.avatar);

    return (
        <>
        <PageHeader title="Chat Interno" description="Comunícate con tu equipo." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
            <Card className="md:col-span-1 flex flex-col">
                 <CardHeader>
                    <CardTitle>Contactos</CardTitle>
                </CardHeader>
                 <ScrollArea className="flex-grow">
                    <CardContent className="space-y-2">
                        {/* General Chat */}
                        <button 
                            onClick={() => setSelectedChat('general')}
                            className={cn("w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors", selectedChat === 'general' ? 'bg-secondary' : 'hover:bg-secondary/50')}
                        >
                            <Avatar className="h-10 w-10 relative">
                                <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground rounded-full">
                                    <Users className="h-5 w-5" />
                                </div>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold">Team Sego</p>
                                <p className="text-xs text-muted-foreground">Chat general del equipo</p>
                            </div>
                        </button>
                        <Separator />
                        {/* Private Chats */}
                        {otherUsers.map(user => (
                                <button 
                                    key={user.id} 
                                    onClick={() => setSelectedChat(user)}
                                    className={cn("w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors", (selectedChat as User)?.id === user.id ? 'bg-secondary' : 'hover:bg-secondary/50')}
                                >
                                    <Avatar className="h-10 w-10 relative">
                                        <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.name} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        <ClientOnly>
                                            <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        </ClientOnly>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            <ClientOnly>
                                                {user.status === 'online' ? 'Online' : format(new Date(user.lastSeen), 'p', {locale: es})}
                                            </ClientOnly>
                                        </p>
                                    </div>
                                    <ClientOnly>
                                    {unreadCounts[user.id] > 0 && (
                                        <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                            {unreadCounts[user.id]}
                                        </span>
                                    )}
                                    </ClientOnly>
                                </button>
                            )
                        )}
                    </CardContent>
                </ScrollArea>
            </Card>

            <Card className="md:col-span-2 flex flex-col">
                <CardHeader className="bg-muted/50">
                    <CardTitle>{chatTitle}</CardTitle>
                </CardHeader>

                <ScrollArea className="flex-1 bg-secondary/20 p-4">
                    <div className="space-y-4">
                         {isLoading ? (
                            <p className="text-center text-muted-foreground">Cargando mensajes...</p>
                        ) : messages.length > 0 ? (
                            messages.map((msg, index) => {
                                const sender = getUserById(msg.senderId);
                                const isCurrentUser = msg.senderId === currentUser.id;
                                const showAvatar = !isCurrentUser && (index === 0 || messages[index-1]?.senderId !== msg.senderId);
                                const isFirstInGroup = isCurrentUser && (index === 0 || messages[index - 1]?.senderId !== msg.senderId);
                                const isLastInGroup = isCurrentUser && (index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId);

                                return (
                                    <div key={msg.id} className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                                        {showAvatar && (
                                             <Avatar className="h-8 w-8 self-end mb-1">
                                                <AvatarImage src={getAvatarUrl(sender?.avatar)} alt={sender?.name} />
                                                <AvatarFallback>{sender ? getInitials(sender.name) : '?'}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "max-w-md p-3 rounded-xl relative shadow-md", 
                                            isCurrentUser ? "bg-primary/80 text-primary-foreground" : "bg-card text-card-foreground border",
                                            !isCurrentUser && !showAvatar && "ml-10"
                                        )}>
                                            {!isCurrentUser && selectedChat === 'general' && (
                                                <p className="text-xs font-bold text-primary mb-1">{sender?.name || 'Desconocido'}</p>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                            <p className={cn(
                                                "text-xs text-right mt-1 opacity-70",
                                                isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                                            )}>
                                                <ClientOnly>
                                                    {format(new Date(msg.createdAt), 'p', { locale: es })}
                                                </ClientOnly>
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <MessageSquare className="h-12 w-12" />
                                <p className="mt-4">No hay mensajes todavía.</p>
                                <p className="text-sm">¡Sé el primero en enviar uno!</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
                
                <CardFooter className="bg-muted/50">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Smile className="h-5 w-5"/>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 border-0">
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme={theme === 'dark' ? 'dark' : 'light'}
                                />
                            </PopoverContent>
                        </Popover>
                        <Input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="bg-background focus-visible:ring-1 focus-visible:ring-ring"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4"/>
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
        </>
    )
}
