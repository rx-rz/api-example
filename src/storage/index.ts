import { S3Client } from "@aws-sdk/client-s3";
import { env } from "../utils/env-vars";

export const storageClient = new S3Client({
    region: "auto",
    endpoint: env.CLOUDFLARE_ENDPOINT,
    credentials: {
        accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
        secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY,
    },
})