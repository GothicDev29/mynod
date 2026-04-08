import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL as string);

export async function testRedisConnection(): Promise<void> {
  const result = await redis.ping();
  console.log("Redis connection successful:", result);
}
