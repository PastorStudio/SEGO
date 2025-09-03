import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/data';

// Desactiva el cache de Next para este endpoint
export const revalidate = 0;
// O, alternativamente:
// export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const all = await getTasks();
    const filtered = (all || []).filter(t => t.projectId === params.id);
    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
