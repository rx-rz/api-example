import type { MiddlewareHandler, Context } from "hono";
import type { RateLimiterRedis } from "rate-limiter-flexible";
import z from "zod";
import { HttpStatus } from "../../lib/http-status-codes";

type GetKey = ({ c }: { c: Context }) => string;

const getRealIP = (c: Context): string => {
  const headers = [
    "cf-connecting-ip", // Cloudflare
    "x-real-ip", // Nginx proxy
    "x-forwarded-for", // Standard proxy header
    "x-client-ip", // Apache mod_proxy
    "x-forwarded", // Various proxies
    "forwarded-for", // RFC 7239
    "forwarded", // RFC 7239
  ];

  for (const header of headers) {
    const value = c.req.header(header);
    if (value) {
      const ip = value.split(",")[0]?.trim();
      if (ip && isValidIP(ip)) {
        return ip;
      }
    }
  }

  try {
    const remoteAddr = c.env?.remoteAddr;
    if (remoteAddr && isValidIP(remoteAddr)) {
      return remoteAddr;
    }
  } catch (err) {
    // i'm ignoring erros related to extraction here sha
  }

  return "unknown";
};

const isValidIP = (ip: string): boolean => {
  const ipSchema = z.ipv4().or(z.ipv6());
  return ipSchema.safeParse(ip).success;
};

export const rateLimit = ({
  limiter,
  getKey,
  skipSuccessfulRequests = false,
  skipFailedRequests = false,
}: {
  limiter: RateLimiterRedis;
  getKey?: GetKey;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}): MiddlewareHandler => {
  return async (c, next) => {
    const ip = getRealIP(c);
    const key = getKey ? getKey({ c }) : ip;

    try {
      const result = await limiter.consume(key);
      c.header("X-RateLimit-Limit", limiter.points.toString());
      c.header("X-RateLimit-Remaining", result.remainingPoints.toString());
      c.header(
        "X-RateLimit-Reset",
        new Date(Date.now() + result.msBeforeNext).toISOString()
      );

      let error: Error | null = null;

      try {
        await next();
      } catch (err) {
        error = err as Error;
        throw err;
      } finally {
        if (skipSuccessfulRequests && !error) {
          await limiter.reward(key, 1);
        } else if (skipFailedRequests && error) {
          await limiter.reward(key, 1);
        }
      }
    } catch (err: any) {
      if (err.remainingPoints !== undefined) {
        const resetTime = new Date(Date.now() + err.msBeforeNext);
        c.header("X-RateLimit-Limit", limiter.points.toString());
        c.header("X-RateLimit-Remaining", "0");
        c.header("X-RateLimit-Reset", resetTime.toISOString());
        c.header("Retry-After", Math.ceil(err.msBeforeNext / 1000).toString());

        return c.json(
          {
            status: "fail",
            data: null,
            message: "Too many requests. Please try again later.",
            retryAfter: Math.ceil(err.msBeforeNext / 1000),
          },
          HttpStatus.TooManyRequests
        );
      }
      throw err;
    }
  };
};
