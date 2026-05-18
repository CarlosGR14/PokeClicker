import { NextRequest, NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

// Configuraciones de rate limit por tipo de endpoint
export const RATE_LIMIT_CONFIGS = {
  AUTH: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  GAME_STATE: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  GAME_SAVE: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 requests per minute
  PRICES: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 requests per minute
  DEFAULT: { maxRequests: 100, windowMs: 60 * 1000 }, // Default: 100 requests per minute
};

/**
 * Obtener identificador del request (IP)
 */
export function getIdentifier(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Middleware de rate limiting genérico
 * @param maxRequests - Máximo de requests permitidos
 * @param windowMs - Ventana de tiempo en milliseconds
 * @param getKeyFn - Función para obtener la clave (por defecto usa IP)
 */
export function rateLimitMiddleware(
  maxRequests: number = 100,
  windowMs: number = 60000, // 1 minute
  getKeyFn?: (req: NextRequest) => string,
) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const key = getKeyFn ? getKeyFn(req) : getIdentifier(req);
      const now = Date.now();

      // Initialize o reset si la ventana expiró
      if (!rateLimitStore[key] || now > rateLimitStore[key].resetTime) {
        rateLimitStore[key] = { count: 0, resetTime: now + windowMs };
      }

      // Verificar si se alcanzó el límite
      if (rateLimitStore[key].count >= maxRequests) {
        const retryAfter = Math.ceil(
          (rateLimitStore[key].resetTime - now) / 1000,
        );
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            retryAfter,
            message: `Máximo de ${maxRequests} requests por ${windowMs / 1000}s alcanzado`,
          },
          {
            status: 429,
            headers: {
              "Retry-After": retryAfter.toString(),
              "X-RateLimit-Limit": maxRequests.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": rateLimitStore[key].resetTime.toString(),
            },
          },
        );
      }

      // Incrementar contador
      rateLimitStore[key].count++;

      // Call the handler
      return handler(req);
    };
  };
}
