import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function isPrivateIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  const [a = 0, b = 0] = parts;
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP(S) URLs are supported");
  if (url.username || url.password) throw new Error("URLs containing credentials are forbidden");
  if (["localhost", "localhost.localdomain"].includes(url.hostname.toLowerCase())) throw new Error("Local addresses are forbidden");
  const records = await lookup(url.hostname, { all: true, verbatim: true });
  if (!records.length) throw new Error("Hostname did not resolve");
  for (const record of records) {
    if (isIP(record.address) === 4 && isPrivateIpv4(record.address)) throw new Error("Private IPv4 targets are forbidden");
    if (isIP(record.address) === 6 && isPrivateIpv6(record.address)) throw new Error("Private IPv6 targets are forbidden");
  }
  return url;
}

export async function safeFetch(raw: string, init: RequestInit = {}, maxBytes = 2_000_000): Promise<Response> {
  const url = await assertPublicHttpUrl(raw);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, { ...init, redirect: "manual", signal: controller.signal, headers: { "user-agent": "SEOForgeBot/1.0 (+https://seoforge.app/bot)", ...init.headers } });
    const length = Number(response.headers.get("content-length") || 0);
    if (length > maxBytes) throw new Error(`Response exceeds ${maxBytes} byte limit`);
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return response;
      const target = new URL(location, url).toString();
      return safeFetch(target, init, maxBytes);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
