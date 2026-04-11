import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { polls, options, votes } from "@/lib/schema";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pollId } = await params;

  // 1. Obtener el poll
  const [poll] = await db.select().from(polls).where(eq(polls.id, pollId));
  if (!poll) {
    return NextResponse.json({ error: "Poll no encontrado" }, { status: 404 });
  }

  // Parsear body
  let body: { optionId: string; sessionToken: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { optionId, sessionToken, password } = body;

  if (!optionId || !sessionToken) {
    return NextResponse.json({ error: "optionId y sessionToken son requeridos" }, { status: 400 });
  }

  // 2. Validar que la opción existe y pertenece a este poll
  const [option] = await db
    .select()
    .from(options)
    .where(and(eq(options.id, optionId), eq(options.pollId, pollId)));

  if (!option) {
    return NextResponse.json({ error: "Opción inválida" }, { status: 400 });
  }

  // 3. Validar acceso si el poll es privado
  if (!poll.isPublic) {
    const hasAccess = await redis.get(`pollAccess:${pollId}:${sessionToken}`);
    if (!hasAccess) {
      return NextResponse.json({ error: "No tienes acceso a este poll privado" }, { status: 403 });
    }
  }

  // 4. Prevención de duplicados
  const voteKey = `vote:${pollId}:${sessionToken}`;
  const alreadyVoted = await redis.exists(voteKey);
  if (alreadyVoted === 1) {
    return NextResponse.json({ error: "Ya votaste en esta encuesta" }, { status: 400 });
  }

  // 5. Conteo atómico en Redis
  await redis.incr(`votes:${pollId}:${optionId}`);

  // 6. Persistencia en PostgreSQL
  try {
    await db.insert(votes).values({ pollId, optionId, sessionToken });
  } catch {
    return NextResponse.json({ error: "Error guardando en base de datos" }, { status: 500 });
  }

  // 7. Marcar como votado (expira en 24h)
  await redis.set(voteKey, "1", "EX", 86400);

  // 8. Obtener conteos actuales de todas las opciones
  const pollOptions = await db.select().from(options).where(eq(options.pollId, pollId));

  const optionsWithVotes = await Promise.all(
    pollOptions.map(async (o) => {
      const votesRaw = await redis.get(`votes:${pollId}:${o.id}`);
      return {
        id: o.id,
        text: o.text,
        votes: votesRaw ? parseInt(votesRaw, 10) : 0,
      };
    })
  );

  const totalVotes = optionsWithVotes.reduce((sum, o) => sum + o.votes, 0);

  return NextResponse.json(
    {
      success: true,
      message: "Voto registrado correctamente",
      options: optionsWithVotes,
      totalVotes,
    },
    { status: 201 }
  );
}
