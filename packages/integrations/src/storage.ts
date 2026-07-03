import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Storage } from "@google-cloud/storage";
import { sha256 } from "@seoforge/core";

function s3StorageClient() {
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) throw new Error("S3 storage is not configured");
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || "auto",
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY },
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
  });
}

function publicObjectUrl(baseUrl: string, key: string) {
  return `${baseUrl.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function putGoogleCloudArtifact(key: string, data: Buffer, contentType: string, hash: string) {
  const bucket = process.env.GCS_BUCKET;
  if (!bucket) throw new Error("GCS_BUCKET is required when STORAGE_PROVIDER=gcs");
  await new Storage().bucket(bucket).file(key).save(data, {
    resumable: false,
    contentType,
    metadata: { metadata: { sha256: hash } },
  });
  const baseUrl = process.env.GCS_PUBLIC_BASE_URL || `https://storage.googleapis.com/${bucket}`;
  return publicObjectUrl(baseUrl, key);
}

async function putS3Artifact(key: string, data: Buffer, contentType: string, hash: string) {
  await s3StorageClient().send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body: data, ContentType: contentType, Metadata: { sha256: hash } }));
  const endpointBase = process.env.S3_ENDPOINT ? `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}` : `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION || "us-east-1"}.amazonaws.com`;
  return publicObjectUrl(process.env.S3_PUBLIC_BASE_URL || endpointBase, key);
}

export async function putArtifact(input: { workspaceId: string; siteId: string; kind: string; data: Buffer; contentType: string; extension: string }) {
  const hash = sha256(input.data);
  const key = `${input.workspaceId}/${input.siteId}/${input.kind}/${hash}.${input.extension.replace(/^\./, "")}`;
  const provider = process.env.STORAGE_PROVIDER || (process.env.GCS_BUCKET ? "gcs" : "s3");
  const url = provider === "gcs"
    ? await putGoogleCloudArtifact(key, input.data, input.contentType, hash)
    : provider === "s3"
      ? await putS3Artifact(key, input.data, input.contentType, hash)
      : (() => { throw new Error(`Unsupported STORAGE_PROVIDER: ${provider}`); })();
  return { key, url, hash, bytes: input.data.byteLength };
}
