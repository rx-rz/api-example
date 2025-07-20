import pino from "pino";
import { env } from "../utils/env-vars";
import "pino-pretty";
export const logger = pino({
  transport: {
    target: env.NODE_ENV === "development" ? "pino-pretty" : "default",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});
