import Redis from "ioredis";

let redisInstance: Redis | null = null;

export function getRedis(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(process.env.REDIS_URL as string, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      enableOfflineQueue: false,
    });
  }
  return redisInstance;
}

export async function testRedisConnection(): Promise<void> {
  const redis = getRedis();
  const result = await redis.ping();
  console.log("Redis connection successful:", result);
}
