import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { polls, options } from "@/lib/schema";

export async function POST(req: NextRequest) {
  try {
    // 1. Extraer session_token del header Authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
    }
    const sessionToken = authHeader.slice(7);

    // 2. Verificar que el token existe en Redis
    const sessionData = await redis.get(`session:${sessionToken}`);
    if (!sessionData) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 });
    }

    // 3. Parsear y validar el body
    let body: { question: string; options: string[]; isPublic: boolean; password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { question, options: optionTexts, isPublic, password } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }
    if (!Array.isArray(optionTexts) || optionTexts.length < 2) {
      return NextResponse.json({ error: "At least 2 options are required" }, { status: 400 });
    }
    if (typeof isPublic !== "boolean") {
      return NextResponse.json({ error: "isPublic must be a boolean" }, { status: 400 });
    }
    if (!isPublic && !password?.trim()) {
      return NextResponse.json({ error: "password is required for private polls" }, { status: 400 });
    }

    // 4. Hashear contraseña si es privada
    const passwordHash = !isPublic && password ? await bcrypt.hash(password, 10) : null;

    // 5 & 6. Crear poll y opciones en la BD
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [poll] = await db
      .insert(polls)
      .values({
        creatorId: sessionToken,
        question: question.trim(),
        isPublic,
        passwordHash,
        expiresAt,
      })
      .returning();

    const insertedOptions = await db
      .insert(options)
      .values(optionTexts.map((text) => ({ pollId: poll.id, text: text.trim() })))
      .returning();

    // 7. Responder 201
    return NextResponse.json(
      {
        id: poll.id,
        question: poll.question,
        isPublic: poll.isPublic,
        options: insertedOptions.map((o) => ({ id: o.id, text: o.text })),
        createdAt: poll.createdAt,
        link: `/polls/${poll.id}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating poll:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const publicPolls = await db
    .select({
      id: polls.id,
      question: polls.question,
      creatorId: polls.creatorId,
      createdAt: polls.createdAt,
    })
    .from(polls)
    .where(eq(polls.isPublic, true));

  return NextResponse.json(publicPolls);
}
