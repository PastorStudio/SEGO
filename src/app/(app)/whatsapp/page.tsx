'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';

interface WhatsAppStatus {
  status: string;
  qr: string | null;
}

export default function WhatsAppPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus() {
    try {
      const response = await fetch('/api/whatsapp/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: WhatsAppStatus = await response.json();
      setStatus(data);
      setError(null);
    } catch (e) {
      console.error("Failed to fetch WhatsApp status:", e);
      setError("No se pudo obtener el estado del servicio de WhatsApp. Asegúrate de que esté corriendo.");
    }
  }

  useEffect(() => {
    fetchStatus(); // Fetch immediately on component mount
    const intervalId = setInterval(fetchStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  function getStatusBadgeVariant(status: string) {
    switch (status) {
      case 'connected':
        return 'default';
      case 'disconnected':
        return 'destructive';
      case 'waiting_for_qr':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'waiting_for_qr':
        return 'Esperando escaneo de QR';
      default:
        return status;
    }
  }

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Conexión de WhatsApp</CardTitle>
          <CardDescription>
            Gestiona la conexión de tu servicio de WhatsApp. Para conectar, escanea el código QR con la aplicación de WhatsApp en tu teléfono (Link Devices).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-medium">Estado:</span>
            {status ? (
              <Badge variant={getStatusBadgeVariant(status.status)} className="text-lg">
                {getStatusText(status.status)}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-lg">Cargando...</Badge>
            )}
          </div>

          {error && (
            <div className="text-center text-destructive">
              <p>{error}</p>
              <p className='text-sm text-muted-foreground'>Ejecuta 'npm run whatsapp:run' en una nueva terminal.</p>
            </div>
          )}

          {status?.status === 'waiting_for_qr' && status.qr && (
            <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
              <h3 className="text-lg font-semibold">Escanea para Conectar</h3>
              <img src={`data:image/png;base64,${Buffer.from(status.qr).toString('base64')}`} alt="Código QR de WhatsApp" />
            </div>
          )}

          {status?.status === 'connected' && (
             <div className="text-center text-green-600">
                <p className="font-semibold">¡Conexión exitosa!</p>
                <p>Ya puedes navegar a la página de chat.</p>
            </div>
          )}

           <Button onClick={fetchStatus} variant="outline">Refrescar Estado</Button>

        </CardContent>
      </Card>
    </div>
  );
}
