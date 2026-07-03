import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyHmacSha256(body: string | Buffer, provided: string, secret: string, prefix = "sha256="): boolean {
  const expected = `${prefix}${createHmac("sha256", secret).update(body).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function eventIdempotencyKey(provider: string, deliveryId: string) {
  if (!provider || !deliveryId) throw new Error("Provider and delivery ID are required");
  return `${provider}:${deliveryId}`;
}
