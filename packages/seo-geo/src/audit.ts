import { safeFetch, sha256, type Finding } from "@seoforge/core";

export type PageSnapshot = {
  url: string;
  status: number;
  title?: string;
  description?: string;
  canonical?: string;
  robots?: string;
  h1: string[];
  images: { src: string; alt?: string }[];
  jsonLd: unknown[];
  bytes: number;
  durationMs: number;
  capturedAt: string;
  contentHash: string;
};

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`${name}=["']([^"']*)["']`, "i"))?.[1]?.trim();
}

function textContent(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function auditPage(url: string): Promise<PageSnapshot> {
  const started = Date.now();
  const response = await safeFetch(url, { headers: { accept: "text/html,application/xhtml+xml" } });
  const html = await response.text();
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  const linkTags = html.match(/<link\b[^>]*>/gi) || [];
  const title = textContent(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "") || undefined;
  const descriptionTag = metaTags.find((tag) => attr(tag, "name")?.toLowerCase() === "description");
  const robotsTag = metaTags.find((tag) => attr(tag, "name")?.toLowerCase() === "robots");
  const canonicalTag = linkTags.find((tag) => attr(tag, "rel")?.toLowerCase().split(/\s+/).includes("canonical"));
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => textContent(m[1] || "")).filter(Boolean);
  const images = (html.match(/<img\b[^>]*>/gi) || []).map((tag) => ({ src: attr(tag, "src") || "", alt: attr(tag, "alt") }));
  const jsonLd = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => {
    try { return JSON.parse(match[1] || "null") as unknown; } catch { return { invalid: true }; }
  });
  return {
    url, status: response.status, title, description: descriptionTag ? attr(descriptionTag, "content") : undefined,
    canonical: canonicalTag ? attr(canonicalTag, "href") : undefined, robots: robotsTag ? attr(robotsTag, "content") : undefined,
    h1, images, jsonLd, bytes: Buffer.byteLength(html), durationMs: Date.now() - started,
    capturedAt: new Date().toISOString(), contentHash: sha256(html),
  };
}

export function findingsFromSnapshot(snapshot: PageSnapshot): Finding[] {
  const evidence = [{ kind: "crawl" as const, sourceUrl: snapshot.url, capturedAt: snapshot.capturedAt, summary: `HTTP ${snapshot.status}; ${snapshot.bytes} bytes`, contentHash: snapshot.contentHash, payload: { status: snapshot.status } }];
  const findings: Finding[] = [];
  const add = (partial: Omit<Finding, "evidence" | "affectedUrls">) => findings.push({ ...partial, affectedUrls: [snapshot.url], evidence });
  if (snapshot.status >= 400) add({ title: `Page returns HTTP ${snapshot.status}`, description: "The page is not successfully reachable.", category: "technical", priority: "critical", confidence: 1, recommendation: "Restore a successful response or redirect intentionally.", expectedImpact: "Required for crawling and indexing." });
  if (!snapshot.title) add({ title: "Missing title", description: "No HTML title was found.", category: "content", priority: "high", confidence: 1, recommendation: "Add a unique, descriptive page title.", expectedImpact: "Improves result comprehension and click relevance." });
  if (!snapshot.description) add({ title: "Missing meta description", description: "No meta description was found.", category: "content", priority: "medium", confidence: 1, recommendation: "Add a useful, unique description; avoid keyword stuffing.", expectedImpact: "May improve search-result messaging." });
  if (!snapshot.h1.length) add({ title: "Missing H1", description: "No visible primary heading was found.", category: "content", priority: "high", confidence: 1, recommendation: "Add one clear primary heading that describes the page.", expectedImpact: "Improves page hierarchy and accessibility." });
  if (snapshot.h1.length > 1) add({ title: "Multiple H1 headings", description: `${snapshot.h1.length} H1 elements were found.`, category: "content", priority: "low", confidence: 0.9, recommendation: "Review whether one primary heading better communicates the page hierarchy.", expectedImpact: "Clarifies document structure." });
  if (!snapshot.canonical) add({ title: "Missing canonical", description: "No canonical link was found.", category: "technical", priority: "high", confidence: 1, recommendation: "Declare the preferred canonical URL for this indexable page.", expectedImpact: "Reduces duplicate URL ambiguity." });
  const noAlt = snapshot.images.filter((image) => image.alt === undefined);
  if (noAlt.length) add({ title: "Images missing alt attributes", description: `${noAlt.length} image elements do not declare alt.`, category: "media", priority: "medium", confidence: 1, recommendation: "Add descriptive alt text for informative images and alt=\"\" for decorative images.", expectedImpact: "Improves accessibility and image understanding." });
  if (snapshot.robots?.toLowerCase().includes("noindex")) add({ title: "Page is marked noindex", description: "The robots directive prevents indexing.", category: "technical", priority: "critical", confidence: 1, recommendation: "Confirm intent; remove noindex from pages intended for organic discovery.", expectedImpact: "Required for index eligibility." });
  return findings;
}

export async function inspectDiscoveryFiles(siteUrl: string) {
  const origin = new URL(siteUrl).origin;
  const [robots, sitemap] = await Promise.allSettled([safeFetch(`${origin}/robots.txt`), safeFetch(`${origin}/sitemap.xml`)]);
  return {
    robots: robots.status === "fulfilled" ? { status: robots.value.status, body: (await robots.value.text()).slice(0, 100_000) } : { error: String(robots.reason) },
    sitemap: sitemap.status === "fulfilled" ? { status: sitemap.value.status, body: (await sitemap.value.text()).slice(0, 500_000) } : { error: String(sitemap.reason) },
  };
}
