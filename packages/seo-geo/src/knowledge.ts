export type SeoPriority = "critical" | "high" | "medium" | "low" | "info";

export const SEO_HEALTH_WEIGHTS = {
  technical: 0.22,
  content: 0.23,
  onPage: 0.2,
  schema: 0.1,
  performance: 0.1,
  geo: 0.1,
  images: 0.05,
} as const;

export const CWV_THRESHOLDS = {
  lcpMs: { good: 2500, poor: 4000 },
  inpMs: { good: 200, poor: 500 },
  cls: { good: 0.1, poor: 0.25 },
} as const;

export const SCHEMA_POLICY = {
  preferredFormat: "JSON-LD",
  recommended: [
    "Organization", "LocalBusiness", "SoftwareApplication", "WebApplication", "Product", "Offer", "Service",
    "Article", "BlogPosting", "NewsArticle", "BreadcrumbList", "WebSite", "WebPage", "Person", "ContactPage",
    "VideoObject", "ImageObject", "Event", "JobPosting", "Course", "DiscussionForumPosting", "ProductGroup", "ProfilePage",
  ],
  restricted: { FAQPage: "Do not recommend for Google rich results outside authoritative government or healthcare sites." },
  deprecated: ["HowTo", "SpecialAnnouncement", "CourseInfo", "EstimatedSalary", "LearningVideo", "ClaimReview", "VehicleListing", "PracticeProblem", "Dataset"],
} as const;

export const GEO_METHODS = [
  { id: "citations", label: "Authoritative citations", rule: "Citations must resolve to a source that supports the adjacent claim." },
  { id: "statistics", label: "Verified statistics", rule: "Every statistic requires a source URL and capture date." },
  { id: "quotations", label: "Attributed quotations", rule: "Quotes require a named source and may not be invented or paraphrased as verbatim." },
  { id: "authority", label: "Authoritative tone", rule: "Use confident language only where evidence supports it." },
  { id: "clarity", label: "Easy-to-understand language", rule: "Prefer answer-first, atomic paragraphs and explicit definitions." },
  { id: "terminology", label: "Technical terminology", rule: "Use domain terms naturally and define unfamiliar terms." },
  { id: "fluency", label: "Fluency and structure", rule: "Use logical headings, short paragraphs, lists, and tables where they aid extraction." },
  { id: "no-stuffing", label: "No keyword stuffing", rule: "Reject repetitive or unnatural exact-match keyword use." },
] as const;

export const AUDIT_RULES = [
  { id: "reachable", priority: "critical", category: "technical", message: "The site and critical pages must return successful HTTP responses." },
  { id: "indexable", priority: "critical", category: "technical", message: "Critical pages must not be blocked by noindex or robots rules." },
  { id: "https", priority: "critical", category: "technical", message: "Production pages must use HTTPS." },
  { id: "canonical", priority: "high", category: "technical", message: "Indexable pages should expose a valid self- or preferred canonical." },
  { id: "sitemap", priority: "high", category: "technical", message: "A valid XML sitemap should enumerate canonical indexable pages." },
  { id: "title", priority: "high", category: "onPage", message: "Each indexable page needs a unique descriptive title." },
  { id: "description", priority: "medium", category: "onPage", message: "Important pages should have useful, unique meta descriptions." },
  { id: "h1", priority: "high", category: "onPage", message: "Each primary page needs a clear visible H1." },
  { id: "schema-visible", priority: "high", category: "schema", message: "Structured data must describe visible, truthful page content." },
  { id: "inp", priority: "high", category: "performance", message: "Measure the current Interaction to Next Paint (INP) responsiveness metric." },
  { id: "image-alt", priority: "medium", category: "images", message: "Non-decorative images require concise descriptive alt text." },
] as const satisfies readonly { id: string; priority: SeoPriority; category: string; message: string }[];

export const MONITORING_DEFAULTS = {
  postDeploy: ["crawl", "schema", "links", "performance", "smoke"],
  daily: ["priority_keywords", "competitors"],
  weekly: ["technical", "content", "schema", "sitemap", "performance", "visual", "geo", "sxo"],
  monthly: ["strategy", "content_decay", "backlinks", "experiments"],
} as const;

export const SOURCE_SKILL_PARITY = [
  "website audit", "meta extraction", "robots and sitemap inspection", "keyword research", "autocomplete ideas",
  "related keywords", "SERP analysis", "backlink analysis", "domain overview", "competitor gap",
  "schema policy", "GEO methods", "platform-aware recommendations", "prioritized report",
] as const;
