import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

export function rateLimitMiddleware(
  maxRequests: number = 10,
  windowMs: number = 60000, // 1 minute
) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const ip =
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown";

      const now = Date.now();
      const key = `${ip}`;

      // Initialize or reset if window expired
      if (!rateLimitStore[key] || now > rateLimitStore[key].resetTime) {
        rateLimitStore[key] = { count: 0, resetTime: now + windowMs };
      }

      // Check if exceeded limit
      if (rateLimitStore[key].count >= maxRequests) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            retryAfter: Math.ceil((rateLimitStore[key].resetTime - now) / 1000),
          },
          { status: 429 },
        );
      }

      // Increment counter
      rateLimitStore[key].count++;

      // Call the handler
      return handler(req);
    };
  };
}
