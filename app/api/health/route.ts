import { NextResponse } from "next/server";
import { testDbConnection } from "@/lib/db";
import { testRedisConnection } from "@/lib/redis";

export async function GET() {
  const [dbResult, redisResult] = await Promise.allSettled([
    testDbConnection(),
    testRedisConnection(),
  ]);

  const database = {
    success: dbResult.status === "fulfilled",
    message:
      dbResult.status === "fulfilled"
        ? "Connected successfully"
        : (dbResult.reason as Error)?.message ?? "Unknown error",
  };

  const redis = {
    success: redisResult.status === "fulfilled",
    message:
      redisResult.status === "fulfilled"
        ? "Connected successfully"
        : (redisResult.reason as Error)?.message ?? "Unknown error",
  };

  const allOk = database.success && redis.success;

  return NextResponse.json(
    {
      status: allOk ? "ok" : "error",
      database,
      redis,
      timestamp: new Date().toISOString(),
    },
    { status: allOk ? 200 : 503 }
  );
}
