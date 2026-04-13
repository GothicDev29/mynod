import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No session' }, { status: 401 });
  }

  const redis = getRedis();
  const name = await redis.get(`session:${token}`);
  if (!name) {
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  return NextResponse.json({ token, name });
}
