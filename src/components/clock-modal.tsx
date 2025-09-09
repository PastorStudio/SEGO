
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useToast } from "@/hooks/use-toast";
import { clockIn, clockOut, getPendingClockIn, getWorkSessions } from "@/lib/data";
import { TimeEntry } from "@/lib/definitions";
import { format, formatDistanceToNow, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Play, Pause, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ClockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClockModal({ isOpen, onClose }: ClockModalProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [pendingEntry, setPendingEntry] = useState<TimeEntry | undefined>(undefined);
  const [workSessions, setWorkSessions] = useState<TimeEntry[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchStatusAndSessions = async () => {
    if (!currentUser?.id) return;
    const pending = await getPendingClockIn(currentUser.id);
    setPendingEntry(pending);
    setIsClockedIn(!!pending);

    const sessions = await getWorkSessions(currentUser.id);
    setWorkSessions(sessions);
  };

  useEffect(() => {
    fetchStatusAndSessions();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000); // Update time every second
    return () => clearInterval(interval);
  }, [currentUser, isOpen]);

  const handleClockIn = async () => {
    if (!currentUser?.id) {
      toast({ title: "Error", description: "No hay usuario logueado.", variant: "destructive" });
      return;
    }
    try {
      const entry = await clockIn(currentUser.id);
      setPendingEntry(entry);
      setIsClockedIn(true);
      toast({ title: "Registro de Entrada", description: "¡Has registrado tu entrada!" });
      fetchStatusAndSessions(); // Refresh sessions
    } catch (error) {
      toast({ title: "Error", description: "No se pudo registrar la entrada.", variant: "destructive" });
    }
  };

  const handleClockOut = async () => {
    if (!pendingEntry?.id || !currentUser?.id) {
      toast({ title: "Error", description: "No hay registro de entrada pendiente.", variant: "destructive" });
      return;
    }
    try {
      await clockOut(pendingEntry.id, currentUser.id);
      setPendingEntry(undefined);
      setIsClockedIn(false);
      toast({ title: "Registro de Salida", description: "¡Has registrado tu salida!" });
      fetchStatusAndSessions(); // Refresh sessions
    } catch (error) {
      toast({ title: "Error", description: "No se pudo registrar la salida.", variant: "destructive" });
    }
  };

  const formatDuration = (minutes?: number) => {
    if (minutes === undefined || minutes === null) return "-";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const currentSessionDuration = useMemo(() => {
    if (isClockedIn && pendingEntry?.clock_in_time) {
      const start = new Date(pendingEntry.clock_in_time);
      return differenceInMinutes(currentTime, start);
    }
    return 0;
  }, [isClockedIn, pendingEntry, currentTime]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Registro de Horas</DialogTitle>
          <DialogDescription>
            Registra tus horas de entrada y salida.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-4xl">{format(currentTime, 'hh:mm:ss a')}</CardTitle>
              <p className="text-sm text-muted-foreground">{format(currentTime, 'EEEE, d MMMM yyyy', { locale: es })}</p>
            </CardHeader>
            <CardContent>
              {isClockedIn ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-green-600">Actualmente Registrado</p>
                  <p className="text-sm text-muted-foreground">Entrada: {pendingEntry?.clock_in_time ? format(new Date(pendingEntry.clock_in_time), 'hh:mm:ss a') : 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Duración: {formatDuration(currentSessionDuration)}</p>
                  <Button onClick={handleClockOut} className="w-full mt-4"><Pause className="mr-2 h-4 w-4" /> Registrar Salida</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-red-600">No Registrado</p>
                  <Button onClick={handleClockIn} className="w-full mt-4"><Play className="mr-2 h-4 w-4" /> Registrar Entrada</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5" /> Sesiones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {workSessions.length > 0 ? (
                  workSessions.map(session => (
                    <div key={session.id} className="mb-2 p-2 border rounded-md">
                      <p className="text-sm font-medium">Entrada: {format(new Date(session.clock_in_time), 'dd/MM/yyyy hh:mm a')}</p>
                      <p className="text-sm text-muted-foreground">Salida: {session.clock_out_time ? format(new Date(session.clock_out_time), 'dd/MM/yyyy hh:mm a') : 'Pendiente'}</p>
                      <p className="text-sm text-muted-foreground">Duración: {formatDuration(session.duration_minutes)}</p>
                      <Separator className="my-2" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">No hay sesiones de trabajo registradas.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
