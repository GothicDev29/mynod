import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { polls } from '@/lib/schema';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pollId } = await params;

  const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));
  if (!poll) {
    return NextResponse.json({ error: 'Poll no encontrado' }, { status: 404 });
  }

  if (poll.isPublic) {
    return NextResponse.json({ error: 'Este poll es público' }, { status: 400 });
  }

  let body: { password: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { password } = body;
  if (!password) {
    return NextResponse.json({ error: 'password es requerido' }, { status: 400 });
  }

  const match = await bcrypt.compare(password, poll.passwordHash!);
  if (!match) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  const sessionToken = req.cookies.get('token')?.value;
  if (sessionToken) {
    await redis.set(`pollAccess:${pollId}:${sessionToken}`, '1', 'EX', 86400);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
