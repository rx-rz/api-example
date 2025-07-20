import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import {
  presignedDownloadUrlSchema,
  presignedUploadUrlSchema,
} from "../../schema/storage.schemas";
import { ZodError } from "zod";
import { getPresignedDownloadUrlService, getPresignedUploadUrlService } from "./storage.services";

const factory = createFactory();

export const getPresignedUploadUrlHandler = factory.createHandlers(
  validator("json", (value) => {
    const parsed = presignedUploadUrlSchema.parse(value);
    return parsed;
  }),
  async (c) => {
    const { key, contentType } = c.req.valid("json");
    const url = await getPresignedUploadUrlService({ key, contentType });
    return c.json({
      status: "success",
      data: {
        url,
      },
    });
  }
);

export const getPresignedDownloadUrlHandler = factory.createHandlers(
  validator("json", (value) => {
    const parsed = presignedDownloadUrlSchema.parse(value);
    return parsed;
  }),
  async (c) => {
    const { key } = c.req.valid("json");
    const url = await getPresignedDownloadUrlService({ key });
    return c.json({
      status: "success",
      data: {
        url,
      },
    });
  }
);

