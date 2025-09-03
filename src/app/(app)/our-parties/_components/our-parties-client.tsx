
'use client'

import { useMemo } from "react";
import { type User } from "@/lib/definitions";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatarUrl } from "@/lib/avatars";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Cake, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from 'react-confetti';
import { useWindowSize } from "@/hooks/use-window-size";

const getInitials = (name: string) => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0]?.toUpperCase() || '';
};

const getNextBirthday = (birthDate: string): Date => {
    const today = new Date();
    const birth = new Date(birthDate);
    birth.setFullYear(today.getFullYear());
    if (birth < today) {
        birth.setFullYear(today.getFullYear() + 1);
    }
    return birth;
};


export function OurPartiesClient({ users }: { users: User[] }) {
  const { width, height } = useWindowSize();

  const sortedUsers = useMemo(() => {
    return [...users]
        .filter(u => u.birthDate)
        .sort((a, b) => {
            const nextBirthdayA = getNextBirthday(a.birthDate!);
            const nextBirthdayB = getNextBirthday(b.birthDate!);
            return nextBirthdayA.getTime() - nextBirthdayB.getTime();
        });
  }, [users]);
  
  const today = new Date();
  const todayMonthDay = `${today.getMonth()}-${today.getDate()}`;
  const isAnyoneBirthdayToday = users.some(u => {
      if (!u.birthDate) return false;
      const birthDate = new Date(u.birthDate);
      return `${birthDate.getMonth()}-${birthDate.getDate()}` === todayMonthDay;
  });

  return (
    <div>
      {isAnyoneBirthdayToday && <Confetti width={width} height={height} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedUsers.map(user => {
          const birthDate = new Date(user.birthDate!);
          const isBirthdayToday = `${birthDate.getMonth()}-${today.getDate()}` === `${today.getMonth()}-${today.getDate()}`;

          return (
            <Card key={user.id} className={cn("overflow-hidden", isBirthdayToday && "border-primary border-2 shadow-lg shadow-primary/20")}>
              {isBirthdayToday && (
                  <div className="bg-primary text-primary-foreground p-2 text-center text-sm font-bold flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    ¡HOY ES SU CUMPLEAÑOS!
                    <Sparkles className="h-4 w-4" />
                  </div>
              )}
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user.profilePicture || getAvatarUrl(user.avatar, user.name)} alt={user.name} />
                  <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-muted-foreground text-sm">{user.role}</p>
                <div className="flex items-center gap-2 mt-4 text-primary">
                    <Cake className="h-5 w-5" />
                    <p className="font-medium">
                        {format(birthDate, "d 'de' MMMM", { locale: es })}
                    </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
       {sortedUsers.length === 0 && (
           <Card>
               <CardContent className="p-12 text-center text-muted-foreground">
                   No hay fechas de cumpleaños registradas.
               </CardContent>
           </Card>
       )}
    </div>
  );
}

