import { NextRequest, NextResponse } from 'next/server';
import { getWarehouseRequests } from '@/lib/data';

export async function GET(
  request: NextRequest,
  context: any
) {
  const all = await getWarehouseRequests();
  const filtered = all.filter(r => r.projectId === context.params.id);
  return NextResponse.json(filtered);
}
