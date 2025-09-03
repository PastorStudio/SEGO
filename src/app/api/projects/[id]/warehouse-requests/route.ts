import { NextResponse } from 'next/server';
import { getWarehouseRequests } from '@/lib/data';

export const revalidate = 0;
// export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const all = await getWarehouseRequests();
    const filtered = (all || []).filter(r => r.projectId === params.id);
    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch warehouse requests' },
      { status: 500 }
    );
  }
}
