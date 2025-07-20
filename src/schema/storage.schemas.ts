import z from "zod";

export const presignedUploadUrlSchema = z.object({
  key: z.string().max(1024),
  contentType: z.string().max(256),
});

export const presignedDownloadUrlSchema = z.object({
  key: z.string().max(1024),
});
