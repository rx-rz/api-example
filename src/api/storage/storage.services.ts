import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../utils/env-vars";
import { storageClient } from "../../storage";

export const getPresignedUploadUrlService = ({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) => {
  const command = new PutObjectCommand({
    Bucket: env.CLOUDFLARE_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(storageClient, command, { expiresIn: 3600 });
};

export const getPresignedDownloadUrlService = ({ key }: { key: string }) => {
  const command = new GetObjectCommand({
    Bucket: env.CLOUDFLARE_BUCKET_NAME,
    Key: key,
  });
  return getSignedUrl(storageClient, command, { expiresIn: 3600 });
};

export const generateFileKey = ({
  userId,
  fileName,
}: {
  userId: string;
  fileName: string;
}) => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `uploads/${userId}/${timestamp}-${sanitizedFileName}`;
};
