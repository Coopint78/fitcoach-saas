import { NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limit middleware
 * @param request NextRequest
 * @param maxRequests Maximum requests allowed
 * @param windowMs Time window in milliseconds (default: 1 minute)
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  maxRequests: number,
  windowMs: number = 60 * 1000
): boolean {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const pathname = request.nextUrl.pathname;
  const key = `${ip}:${pathname}`;

  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count < maxRequests) {
    entry.count++;
    return true;
  }

  return false;
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Too many requests, please try again later" },
    { status: 429 }
  );
}
