import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/data';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const all = await getTasks();
  const filtered = all.filter(t => t.projectId === params.id);
  return NextResponse.json(filtered);
}
