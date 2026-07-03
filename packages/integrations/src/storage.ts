import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { sha256 } from "@seoforge/core";

function storageClient() {
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) throw new Error("S3 storage is not configured");
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || "auto",
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY },
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
  });
}

export async function putArtifact(input: { workspaceId: string; siteId: string; kind: string; data: Buffer; contentType: string; extension: string }) {
  const hash = sha256(input.data);
  const key = `${input.workspaceId}/${input.siteId}/${input.kind}/${hash}.${input.extension.replace(/^\./, "")}`;
  await storageClient().send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body: input.data, ContentType: input.contentType, Metadata: { sha256: hash } }));
  const base = (process.env.S3_PUBLIC_BASE_URL || `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`).replace(/\/$/, "");
  return { key, url: `${base}/${key}`, hash, bytes: input.data.byteLength };
}
