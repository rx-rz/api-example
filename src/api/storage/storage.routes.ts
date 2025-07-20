import { Hono } from "hono";
import {
  getPresignedDownloadUrlHandler,
  getPresignedUploadUrlHandler,
} from "./storage.handlers";
import { ROUTES } from "../../utils/routes";

export const storageRoutes = new Hono();

storageRoutes.put(ROUTES.storage.getPresignedUploadUrl, ...getPresignedUploadUrlHandler);
storageRoutes.post(
  ROUTES.storage.getPresignedDownloadUrl,
  ...getPresignedDownloadUrlHandler
);
