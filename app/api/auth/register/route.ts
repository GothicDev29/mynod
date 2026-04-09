import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  let body: { name: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const token = crypto.randomUUID();
  await redis.set(`session:${token}`, name.trim(), 'EX', 86400);

  const res = NextResponse.json({ token, userId: name.trim() }, { status: 201 });
  res.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 86400,
    sameSite: 'lax',
  });
  return res;
}
