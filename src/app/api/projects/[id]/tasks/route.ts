import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/data';

// Desactiva caché para este endpoint
export const revalidate = 0;

export async function GET(req: Request, context: any) {
  try {
    // Soporta tanto objeto como promesa (por el problema de tipos en tu repo)
    const { id } = context?.params ? await context.params : { id: undefined };

    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }

    const all = await getTasks();
    const filtered = (all || []).filter((t) => t.projectId === id);

    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
