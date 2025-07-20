import { redisClient } from "../cache";
import { RateLimiterRedis } from "rate-limiter-flexible";

export const rateLimiter = ({
  points = 20,
  duration = 60,
  prefix = "rl",
}: {
  points: number;
  duration: number;
  prefix: string;
}) => {
  new RateLimiterRedis({
    storeClient: redisClient,
    points,
    duration,
    keyPrefix: prefix,
  });
};

export const globalRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "rate-limit:global",
  points: 100,
  duration: 60,
  inMemoryBlockOnConsumed: 200,
});
