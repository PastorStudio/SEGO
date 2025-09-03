import { NextResponse } from 'next/server';
import { getWarehouseRequests } from '@/lib/data';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const all = await getWarehouseRequests();
  const filtered = all.filter(r => r.projectId === params.id);
  return NextResponse.json(filtered);
}
