import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { polls, options } from "@/lib/schema";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Obtener el poll de la BD
  const [poll] = await db.select().from(polls).where(eq(polls.id, id));

  if (!poll) {
    return NextResponse.json({ error: "Poll no encontrado" }, { status: 404 });
  }

  // 2. Validar acceso si el poll es privado
  if (!poll.isPublic) {
    const password = req.nextUrl.searchParams.get("password");

    if (!password) {
      return NextResponse.json({ error: "Este poll es privado" }, { status: 400 });
    }

    const passwordMatch = await bcrypt.compare(password, poll.passwordHash!);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }
  }

  // 3. Obtener todas las opciones del poll
  const pollOptions = await db.select().from(options).where(eq(options.pollId, id));

  // 4. Obtener conteo de votos desde Redis para cada opción
  const optionsWithVotes = await Promise.all(
    pollOptions.map(async (option) => {
      const votesRaw = await redis.get(`votes:${id}:${option.id}`);
      return {
        id: option.id,
        text: option.text,
        votes: votesRaw ? parseInt(votesRaw, 10) : 0,
      };
    })
  );

  const totalVotes = optionsWithVotes.reduce((sum, o) => sum + o.votes, 0);

  // 5. Responder 200
  return NextResponse.json({
    id: poll.id,
    question: poll.question,
    isPublic: poll.isPublic,
    options: optionsWithVotes,
    totalVotes,
    createdAt: poll.createdAt,
  });
}
