import { MiddlewareHandler } from "hono";
import { logger } from "../../logger";

export const loggingMiddleware: MiddlewareHandler = async (c, next) => {
  const reqId = c.req.header("x-request-id") ?? crypto.randomUUID();
  const start = performance.now();

  c.set("reqId", reqId);
  c.set("logger", logger);
  try {
    const duration = performance.now() - start;
    logger.info({
      msg: "Request completed",
      reqId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration: `${duration.toFixed(2)}ms`,
    });
    await next();
  } catch (err: any) {
    throw err;
  }
};
