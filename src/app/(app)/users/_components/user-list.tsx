
"use client";

import { type User } from "@/lib/definitions";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserActions } from "./user-actions";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ClientOnly } from "@/components/client-only";
import Link from "next/link";
import { getAvatarUrl } from "@/lib/avatars";
import { Cake } from "lucide-react";

const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0]?.toUpperCase() || '';
}

const roleVariant: { [key in User['role']]: "default" | "secondary" | "destructive" | "outline" } = {
  "Super-Admin": "destructive",
  "Admin": "destructive",
  "Agent": "outline",
  "Viewer": "secondary"
}


export function UserList({ users }: { users: User[] }) {
  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  }

  const isBirthday = (user: User): boolean => {
    if (!user.birthDate) return false;
    const today = new Date();
    const birthDate = new Date(user.birthDate);
    return today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() === birthDate.getUTCDate();
  };

  return (
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden sm:table-cell">Cargo</TableHead>
                <TableHead className="hidden md:table-cell">Rol</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const birthday = isBirthday(user);
                return (
                    <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex items-center gap-4">
                        <Avatar className="relative">
                           <AvatarImage src={user.profilePicture || getAvatarUrl(user.avatar, user.name)} alt={user.name} />
                           <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            <ClientOnly>
                                {birthday && (
                                    <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1 border-2 border-background animate-bounce">
                                        <Cake className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                )}
                                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background ${user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                            </ClientOnly>
                        </Avatar>
                        <div>
                            <Link href={`/users/${user.id}`} className="font-medium hover:underline text-primary">{user.name}</Link>
                            <div className="text-sm text-muted-foreground">
                                <ClientOnly fallback={<span className="text-gray-400">...</span>}>
                                    {user.status === 'online' ? <span className="text-green-400">En línea</span> : `Visto por última vez ${formatLastSeen(user.lastSeen)}`}
                                </ClientOnly>
                            </div>
                        </div>
                        </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{user.position || 'N/A'}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <UserActions user={user} />
                        </TableCell>
                    </TableRow>
                )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  )
}
