export const ROUTES = {
  healthCheck: "/health",
  storage: {
    base: "/storage",
    getPresignedUploadUrl: "/get-presigned-upload-url",
    getPresignedDownloadUrl: "/get-presigned-download-url",
  },
} as const;
