import crypto from "node:crypto";
import Redis from "ioredis";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_TTL_SECONDS = 3600;
const fallbackCache = new Map<string, CacheEntry<string>>();
let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
    });
  }

  return redisClient;
}

export function createCacheKey(...parts: Array<string | number | undefined | null>) {
  const normalized = parts
    .filter((part) => part !== undefined && part !== null)
    .map((part) => (typeof part === "string" ? part : String(part)))
    .join("::");

  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedis();
  if (client) {
    try {
      const value = await client.get(key);
      if (value) {
        return value;
      }
    } catch {
      // swallow redis errors and fall back to memory cache
    }
  }

  const entry = fallbackCache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt < Date.now()) {
    fallbackCache.delete(key);
    return null;
  }

  return entry.value;
}

export async function cacheSet(key: string, value: string, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const client = getRedis();
  if (client) {
    try {
      await client.set(key, value, "EX", ttlSeconds);
      return;
    } catch {
      // fall back to memory cache
    }
  }

  fallbackCache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function cacheDelete(key: string) {
  fallbackCache.delete(key);
  if (redisClient) {
    redisClient.del(key).catch(() => undefined);
  }
}

export function cacheStats() {
  return {
    fallbackSize: fallbackCache.size,
    redisConnected: Boolean(redisClient?.status === "ready"),
  };
}
