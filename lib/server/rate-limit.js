import { createHash } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const limiters = new Map();

function getClientIdentifier(request) {
  const trustedIp =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown";
  return createHash("sha256").update(trustedIp).digest("hex");
}

export async function enforceRateLimit(request, { key, limit, window }) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis rate limiting is not configured.");
  }

  const redis = new Redis({ url, token });
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `farhan-thinks:${key}`,
      analytics: false,
    });
    limiters.set(key, limiter);
  }

  const result = await limiter.limit(getClientIdentifier(request));
  return {
    allowed: result.success,
    retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
  };
}

export function hasValidOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function readJsonBody(request, maximumBytes = 12000) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maximumBytes) {
    return { error: "Request body is too large.", status: 413 };
  }

  try {
    const reader = request.body?.getReader();
    if (!reader) {
      return { error: "Request body must be valid JSON.", status: 400 };
    }

    const chunks = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maximumBytes) {
        await reader.cancel();
        return { error: "Request body is too large.", status: 413 };
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { error: "Request body must be a JSON object.", status: 400 };
    }
    return { body };
  } catch {
    return { error: "Request body must be valid JSON.", status: 400 };
  }
}
