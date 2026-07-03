import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type EncryptedSecret = { version: 1; iv: string; tag: string; ciphertext: string };

function keyFromEnvironment(): Buffer {
  const encoded = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!encoded) throw new Error("CREDENTIAL_ENCRYPTION_KEY is required");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("CREDENTIAL_ENCRYPTION_KEY must decode to 32 bytes");
  return key;
}

export function encryptSecret(value: unknown, aad: string): EncryptedSecret {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFromEnvironment(), iv);
  cipher.setAAD(Buffer.from(aad));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return { version: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") };
}

export function decryptSecret<T>(secret: EncryptedSecret, aad: string): T {
  const decipher = createDecipheriv("aes-256-gcm", keyFromEnvironment(), Buffer.from(secret.iv, "base64"));
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(Buffer.from(secret.tag, "base64"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(secret.ciphertext, "base64")), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}

export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function redactSecrets(value: string): string {
  return value
    .replace(/(api[_-]?key|token|password|secret|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=[REDACTED]")
    .replace(/(?:gh[oprsu]_[A-Za-z0-9_]{20,}|sk_(?:live|test)_[A-Za-z0-9]{16,}|AIza[A-Za-z0-9_-]{20,})/g, "[REDACTED]");
}
