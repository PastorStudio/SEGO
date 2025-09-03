import { NextResponse } from 'next/server';
import { getWarehouseRequests } from '@/lib/data';

export const revalidate = 0;

export async function GET(req: Request, context: any) {
  try {
    const { id } = context?.params ? await context.params : { id: undefined };

    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }

    const all = await getWarehouseRequests();
    const filtered = (all || []).filter((r) => r.projectId === id);

    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch warehouse requests' }, { status: 500 });
  }
}
