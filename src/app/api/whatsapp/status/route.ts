import { NextResponse } from 'next/server';
import { getWhatsAppStatus } from '@/lib/whatsapp-service';

export async function GET() {
  try {
    const status = getWhatsAppStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error('[WHATSAPP_STATUS_API]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
