import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { eventIdempotencyKey, verifyHmacSha256, verifyVercelSignature } from "./webhooks.js";

describe("webhook safety", () => {
  it("verifies signatures with timing-safe comparison", () => {
    const secret = "secret"; const body = "payload";
    const signature = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
    expect(verifyHmacSha256(body, signature, secret)).toBe(true);
    expect(verifyHmacSha256(body, "sha256=bad", secret)).toBe(false);
  });
  it("creates stable idempotency keys", () => expect(eventIdempotencyKey("github", "1")).toBe("github:1"));
  it("verifies Vercel account-webhook SHA-1 signatures",()=>{const secret="vercel-secret",body=JSON.stringify({type:"deployment.succeeded"}),signature=createHmac("sha1",secret).update(body).digest("hex");expect(verifyVercelSignature(body,signature,secret)).toBe(true);expect(verifyVercelSignature(`${body}x`,signature,secret)).toBe(false)});
});
