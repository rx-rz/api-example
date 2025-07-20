import { Context } from "hono";
import { logger } from "../logger";
import z, { ZodError } from "zod";
import { isHttpError } from "http-errors-enhanced";
import { HttpStatus } from "./http-status-codes";
import { Logger } from "pino";

type PgParsedError = {
  status: number;
  jsend: {
    status: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export const onError = (err: unknown, c: Context) => {
  const reqId = c.get("reqId");
  const log: Logger = c.get("logger") ?? logger;
  let status = 500;
  let jsend: any = {
    status: "error",
    message: "Internal server error",
  };

  if (err instanceof ZodError) {
    status = HttpStatus.BadRequest;
    jsend = {
      status: "fail",
      data: z.treeifyError(err).errors,
    };
  } else if (isHttpError(err)) {
    status = err.status;
    jsend = {
      status: status >= HttpStatus.InternalServerError ? "error" : "fail",
      message: err.message,
      details: err.details,
    };
  } else if (
    err instanceof SyntaxError &&
    err.message.includes("JSON") &&
    c.req.header("content-type")?.includes("application/json")
  ) {
    status = HttpStatus.BadRequest;
    jsend = {
      status: "fail",
      message: "Invalid JSON payload",
    };
  } else if (err instanceof Error && err.message.includes("Redis")) {
    status = HttpStatus.InternalServerError;
    jsend = {
      status: "error",
      message: err.message,
    };
  } else if (err instanceof Error && err.name === "DatabaseError") {
    const { status: dbStatus, jsend: dbJsend } = parsePostgresError(err as any);
    status = dbStatus;
    jsend = dbJsend;
  }

  log.error({
    reqId,
    path: c.req.path,
    method: c.req.method,
    status,
    error: err instanceof Error ? err.message : String(err),
    jsend,
  });

  return { jsend, status };
};

export const parsePostgresError = (err: any): PgParsedError => {
  const code = err.code;

  const fallback = {
    status: HttpStatus.InternalServerError,
    jsend: {
      status: "error",
      message: "Unexpected database error",
    },
  };

  if (!code) return fallback;

  const base = {
    code,
    detail: err.detail,
    schema: err.schema,
    table: err.table,
    column: err.column,
    constraint: err.constraint,
    hint: err.hint,
  };

  switch (code) {
    case "23505": // unique_violation
      return {
        status: HttpStatus.Conflict,
        jsend: {
          status: "fail",
          message: "Resource already exists",
          details: base,
        },
      };

    case "23503": // foreign_key_violation
      return {
        status: HttpStatus.UnprocessableEntity,
        jsend: {
          status: "fail",
          message: "Related resource does not exist",
          details: base,
        },
      };

    case "23502": // not_null_violation
      return {
        status: HttpStatus.BadRequest,
        jsend: {
          status: "fail",
          message: `Missing required field: ${err.column}`,
          details: base,
        },
      };

    case "42703": // undefined_column
    case "42P01": // undefined_table
      return {
        status: HttpStatus.InternalServerError,
        jsend: {
          status: "error",
          message: "Query references unknown database entity",
          details: base,
        },
      };

    default:
      return fallback;
  }
};
